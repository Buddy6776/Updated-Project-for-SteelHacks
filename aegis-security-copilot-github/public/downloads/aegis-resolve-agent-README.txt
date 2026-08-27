Aegis Resolve local agent prototype
===================================

Requirements: Python 3.11+ and Git.

1. Save a proposed unified Git patch locally.
2. Preview and validate it:

   python3 aegis-resolve-agent.py preview --workspace /path/to/repository --patch proposed.patch

3. Review the patch and affected files. If approved, copy the exact SHA-256
   fingerprint printed by the preview:

   python3 aegis-resolve-agent.py apply --workspace /path/to/repository --patch proposed.patch --approve EXACT_SHA256

The agent refuses dirty Git workspaces, binary or oversized patches, path
traversal, common secret locations, and patches that fail `git apply --check`.
It has no network client, remote-control channel, or arbitrary shell interface.

This is a conference prototype. Review the resulting diff, run the project's
tests, keep a backup, and rescan before deployment.
