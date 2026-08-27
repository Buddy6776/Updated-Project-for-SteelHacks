# Contributing

Thanks for helping improve Aegis Security Copilot.

## Development workflow

1. Fork the repository and create a focused branch.
2. Install dependencies with `pnpm install`.
3. Keep the scanner service in mock mode while developing.
4. Make a small, reviewable change.
5. Run `pnpm build` before opening a pull request.

## Adding a security capability

Every new capability should document:

- Whether it is passive, active, offline, or separately licensed
- What ownership verification and authorization it requires
- Its fixed command or API shape; model-generated shell strings are not allowed
- Timeout, resource, rate, and output limits
- What evidence it stores and how sensitive data is redacted
- How it is isolated from the web application and other customers

Use mock fixtures for pull requests whenever possible. Never commit live customer targets, scan data, credentials, hash files, API tokens, or local `.env` files.

Authentication or authorization changes require explicit tests for unauthenticated access, cross-account record access, cookie behavior, lockout behavior, and secret redaction. Do not replace password hashing, session-token hashing, or server-side ownership checks with client-only controls.

## Pull requests

Explain the user-facing behavior, security impact, test coverage, and any new operational requirements. Changes that weaken verification, allowlisting, isolation, or approval controls will not be accepted.
