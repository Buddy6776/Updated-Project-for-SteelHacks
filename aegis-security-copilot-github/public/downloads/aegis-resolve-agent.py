#!/usr/bin/env python3
"""Aegis Resolve local patch agent prototype.

This agent has no network client and no general-purpose shell. It previews or
applies one customer-supplied unified Git patch inside an explicitly selected,
clean Git workspace. Applying requires the exact SHA-256 patch fingerprint.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import sys
from datetime import datetime, timezone

MAX_PATCH_BYTES = 1_000_000
BLOCKED_PARTS = {".git", ".env", ".ssh", "id_rsa", "id_ed25519", "credentials", "secrets"}


def git(workspace: pathlib.Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", "-C", str(workspace), *args],
        check=False,
        capture_output=True,
        text=True,
        timeout=60,
        env={"PATH": "/usr/local/bin:/usr/bin:/bin"},
    )


def validate_workspace(raw: str) -> pathlib.Path:
    workspace = pathlib.Path(raw).expanduser().resolve(strict=True)
    if not workspace.is_dir() or git(workspace, "rev-parse", "--is-inside-work-tree").stdout.strip() != "true":
        raise ValueError("The selected workspace must be an existing Git repository.")
    return workspace


def read_patch(raw: str) -> tuple[pathlib.Path, bytes, str]:
    path = pathlib.Path(raw).expanduser().resolve(strict=True)
    data = path.read_bytes()
    if not data or len(data) > MAX_PATCH_BYTES:
        raise ValueError("The patch must be between 1 byte and 1 MB.")
    if b"GIT binary patch" in data or b"\x00" in data:
        raise ValueError("Binary patches are not supported.")
    return path, data, hashlib.sha256(data).hexdigest()


def affected_files(data: bytes) -> list[str]:
    text = data.decode("utf-8", errors="strict")
    files = []
    for match in re.finditer(r"^\+\+\+ b/(.+)$", text, re.MULTILINE):
        relative = pathlib.PurePosixPath(match.group(1))
        if relative.is_absolute() or ".." in relative.parts or any(part.lower() in BLOCKED_PARTS for part in relative.parts):
            raise ValueError(f"Blocked or unsafe patch path: {relative}")
        files.append(str(relative))
    if not files:
        raise ValueError("No supported modified files were found in the patch.")
    return sorted(set(files))


def main() -> int:
    parser = argparse.ArgumentParser(description="Preview or apply one approved Aegis remediation patch.")
    parser.add_argument("mode", choices=["preview", "apply"])
    parser.add_argument("--workspace", required=True, help="Authorized local Git repository")
    parser.add_argument("--patch", required=True, help="Unified Git patch file")
    parser.add_argument("--approve", help="Exact SHA-256 shown during preview")
    args = parser.parse_args()

    try:
        workspace = validate_workspace(args.workspace)
        patch_path, data, fingerprint = read_patch(args.patch)
        files = affected_files(data)
        check = git(workspace, "apply", "--check", "--whitespace=error", str(patch_path))
        if check.returncode != 0:
            raise ValueError(check.stderr.strip() or "Git rejected the patch preview.")
        result = {"workspace": str(workspace), "patch_sha256": fingerprint, "affected_files": files, "valid": True}
        if args.mode == "preview":
            print(json.dumps(result, indent=2))
            print("Review the patch, then rerun with: apply --approve", fingerprint)
            return 0
        if args.approve != fingerprint:
            raise ValueError("Approval fingerprint does not exactly match this patch.")
        if git(workspace, "status", "--porcelain").stdout.strip():
            raise ValueError("The Git workspace has uncommitted changes. Commit or safely store them before applying a patch.")
        applied = git(workspace, "apply", "--whitespace=error", str(patch_path))
        if applied.returncode != 0:
            raise ValueError(applied.stderr.strip() or "The approved patch could not be applied.")
        audit = workspace / ".aegis-resolve-audit.jsonl"
        with audit.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps({**result, "applied_at": datetime.now(timezone.utc).isoformat()}) + "\n")
        print(json.dumps({**result, "applied": True, "next": "Review the diff, run tests, and rescan before deployment."}, indent=2))
        return 0
    except (ValueError, OSError, subprocess.SubprocessError, UnicodeError) as error:
        print(f"Aegis Resolve stopped safely: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
