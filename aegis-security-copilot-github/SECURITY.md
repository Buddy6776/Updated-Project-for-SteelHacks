# Security policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately to the repository owner instead of opening a public issue. Include the affected component, reproduction steps, impact, and a suggested mitigation when possible. Do not include passwords, private keys, customer hashes, access tokens, or other sensitive data in a report.

## Authorized-use boundary

Contributions must preserve these controls:

- Anonymous checks remain passive and low impact.
- Active tools run only against verified, explicitly allowlisted assets.
- Higher-risk workflows require clear approval and an auditable record.
- The language model may select a structured tool action but may never construct or execute arbitrary shell text.
- Tool adapters use fixed argument builders, strict input validation, timeouts, output limits, and isolated workers.
- Password-audit tools process customer-provided files offline and never collect credentials from a target.
- Endpoint agents use explicit enrollment, collect only documented posture data, and cannot accept arbitrary remote commands.
- Public email checks use fixed DNS-over-HTTPS lookups only; they never send mail, access mailboxes, enumerate users, or request credentials.
- Account passwords are salted and processed with PBKDF2; raw passwords and session credentials must never be logged or stored.
- Every workspace query must authorize records by the current server-side session user rather than trusting a client-provided user identifier.

The project must not add stealth, persistence, credential theft, destructive exploitation, authorization bypass, arbitrary command execution, or functionality intended to evade monitoring.

## Deployment note

The included scanner service starts in mock mode. Before enabling any live adapter, perform a security review, add authenticated queueing, isolate the worker, configure a narrow target allowlist, and verify that local law and the asset owner's written authorization permit the test.

The included email/password account flow is an MVP. Do not use it for production customer data until email verification, recovery, MFA or SSO, bot protection, session management, audit logging, privacy controls, and an independent authentication assessment are complete. Email and SMS destinations are stored as preferences; no production delivery provider is included.
