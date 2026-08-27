#!/usr/bin/env python3
"""Aegis EDR MVP agent.

Collects a small, privacy-conscious set of device posture signals and reports
them over HTTPS. It cannot accept remote commands or terminate processes.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

VERSION = "0.1.0"


def fixed_command(arguments: list[str]) -> str | None:
    try:
        completed = subprocess.run(arguments, capture_output=True, text=True, timeout=8, check=False)
    except (FileNotFoundError, PermissionError, subprocess.TimeoutExpired):
        return None
    return f"{completed.stdout}\n{completed.stderr}".strip().lower()


def firewall_enabled() -> bool | None:
    system = platform.system()
    if system == "Darwin":
        output = fixed_command(["/usr/libexec/ApplicationFirewall/socketfilterfw", "--getglobalstate"])
        return None if output is None else "enabled" in output
    if system == "Windows":
        output = fixed_command(["netsh", "advfirewall", "show", "allprofiles", "state"])
        return None if output is None else "state" in output and "on" in output
    output = fixed_command(["ufw", "status"])
    if output is not None:
        return "status: active" in output
    output = fixed_command(["firewall-cmd", "--state"])
    return None if output is None else "running" in output


def disk_encryption_enabled() -> bool | None:
    system = platform.system()
    if system == "Darwin":
        output = fixed_command(["fdesetup", "status"])
        return None if output is None else "filevault is on" in output
    if system == "Windows":
        output = fixed_command(["manage-bde", "-status", "C:"])
        if output is None:
            return None
        return "percentage encrypted: 100%" in output or "conversion status: fully encrypted" in output
    return None


def automatic_updates_enabled() -> bool | None:
    system = platform.system()
    if system == "Darwin":
        output = fixed_command(["softwareupdate", "--schedule"])
        return None if output is None else "on" in output
    return None


def hash_file(path: Path) -> str | None:
    try:
        if not path.is_file() or path.stat().st_size > 20_000_000:
            return None
        digest = hashlib.sha256()
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(65536), b""):
                digest.update(chunk)
        return digest.hexdigest()
    except (OSError, PermissionError):
        return None


def integrity_events(paths: list[str], state_path: Path) -> list[dict[str, str]]:
    previous: dict[str, str] = {}
    try:
        previous = json.loads(state_path.read_text())
    except (OSError, ValueError, TypeError):
        pass
    current: dict[str, str] = {}
    events: list[dict[str, str]] = []
    for raw in paths[:20]:
        path = Path(raw).expanduser().resolve()
        digest = hash_file(path)
        if digest is None:
            continue
        key = str(path)
        current[key] = digest
        if key in previous and previous[key] != digest:
            events.append({"eventType": "protected_file_changed", "severity": "medium", "title": "Protected file changed", "detail": f"A monitored file changed: {path.name}. Review whether the change was expected."})
    try:
        state_path.parent.mkdir(parents=True, exist_ok=True)
        state_path.write_text(json.dumps(current, indent=2))
        if os.name != "nt":
            state_path.chmod(0o600)
    except OSError:
        pass
    return events


def payload(watch_paths: list[str], state_path: Path) -> dict[str, Any]:
    return {
        "hostname": socket.gethostname(),
        "platform": platform.system(),
        "osVersion": platform.platform(),
        "agentVersion": VERSION,
        "firewallEnabled": firewall_enabled(),
        "diskEncryption": disk_encryption_enabled(),
        "autoUpdates": automatic_updates_enabled(),
        "events": integrity_events(watch_paths, state_path),
    }


def send(server: str, token: str, data: dict[str, Any]) -> dict[str, Any]:
    endpoint = f"{server.rstrip('/')}/api/agent/heartbeat"
    if not endpoint.startswith("https://") and not endpoint.startswith("http://localhost"):
        raise ValueError("The server must use HTTPS (localhost is allowed for development).")
    request = urllib.request.Request(endpoint, data=json.dumps(data).encode(), method="POST", headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json", "User-Agent": f"AegisEndpoint/{VERSION}"})
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read())


def main() -> int:
    parser = argparse.ArgumentParser(description="Aegis defensive endpoint posture agent")
    parser.add_argument("--server", default=os.getenv("AEGIS_SERVER_URL"), help="Aegis site URL")
    parser.add_argument("--token", default=os.getenv("AEGIS_AGENT_TOKEN"), help="One-time endpoint enrollment token")
    parser.add_argument("--interval", type=int, default=60, help="Heartbeat interval in seconds (minimum 60)")
    parser.add_argument("--once", action="store_true", help="Send one heartbeat and exit")
    parser.add_argument("--dry-run", action="store_true", help="Print collected data without sending it")
    parser.add_argument("--watch-path", action="append", default=[], help="File to monitor for unexpected changes; repeatable")
    parser.add_argument("--state", default=str(Path.home() / ".aegis" / "agent-state.json"), help="Local integrity baseline file")
    args = parser.parse_args()
    if not args.dry_run and (not args.server or not args.token):
        parser.error("--server and --token are required unless --dry-run is used")
    interval = max(60, min(args.interval, 3600))
    while True:
        data = payload(args.watch_path, Path(args.state))
        try:
            result = data if args.dry_run else send(args.server, args.token, data)
            print(json.dumps(result, indent=2))
        except (ValueError, urllib.error.URLError, json.JSONDecodeError) as error:
            print(f"Aegis heartbeat failed: {error}", file=sys.stderr)
            if args.once:
                return 1
        if args.once or args.dry_run:
            return 0
        time.sleep(interval)


if __name__ == "__main__":
    raise SystemExit(main())
