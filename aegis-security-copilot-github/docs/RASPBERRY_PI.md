# Host Aegis on a Raspberry Pi 4B

This deployment keeps the Aegis web application, accounts, sessions, website records, scan history, endpoint records, and notification preferences on the Raspberry Pi. The database is stored in a named Docker volume on the Pi and survives restarts and upgrades.

The website and email checks still need outbound internet access to reach the website being reviewed and public DNS services. No Aegis account or scan-history database is hosted by the Sites deployment when you use this Pi mode.

## Requirements

- Raspberry Pi 4B running a **64-bit** Raspberry Pi OS or another 64-bit Debian-based distribution
- Docker Engine with the Docker Compose plugin
- At least 4 GB of memory recommended for building the image
- At least 8 GB of free storage, preferably on a reliable SSD rather than an SD card
- A wired Ethernet connection and a reserved LAN address for dependable endpoint heartbeats

## Start on your local network

Clone or copy the repository onto the Raspberry Pi, then run:

```bash
chmod +x scripts/aegis-pi
./scripts/aegis-pi start
```

The first build downloads the ARM64 Node.js image and application dependencies, so it can take several minutes. Later starts reuse Docker's build cache.

Open `http://PI_ADDRESS:3000` from another device on the same network. The launcher prints the address it finds automatically.

Useful commands:

```bash
./scripts/aegis-pi status
./scripts/aegis-pi logs
./scripts/aegis-pi backup
./scripts/aegis-pi restart
./scripts/aegis-pi update
./scripts/aegis-pi stop
```

`stop` does not delete the `aegis-pi-data` Docker volume. Do not run `docker compose down --volumes` unless you intentionally want to erase the application database.

## Data and backups

The local database lives in the `aegis-pi-data` Docker volume. `./scripts/aegis-pi backup` briefly stops the web service, creates a consistent timestamped archive in `backups/`, and starts the service again.

Copy backup archives to a second device or encrypted cloud-storage account. A backup kept only on the same Pi will not help if its storage fails or the device is stolen.

## Optional HTTPS and internet access

LAN-only hosting is the safer starting point for this MVP. If remote employees need access, prefer a private VPN such as Tailscale or WireGuard.

To use a public domain, copy the example configuration and edit the domain:

```bash
cp raspberry-pi.env.example .env
./scripts/aegis-pi public
```

Point the domain's DNS record to your public IP and forward TCP ports 80 and 443, plus UDP 443, from the router to the Pi. The optional Caddy service obtains and renews HTTPS certificates and forwards traffic to Aegis. Do not forward port 3000 or scanner port 8080 when Caddy is handling public traffic.

Before using this as a real public business service, add MFA or SSO, email verification and recovery, API rate limits, bot protection, centralized audit logs, automated encrypted off-device backups, update monitoring, and an independent security review. The current authentication remains an MVP.

## Optional scanner service

The structured scanner API can also run on the Pi:

```bash
./scripts/aegis-pi tools
```

It binds only to `127.0.0.1:8080`, runs without Linux capabilities, and returns simulated results by default. The web application is not yet connected to this runner. Live tools must be installed in a dedicated image, targets must be explicitly allowlisted, and each active assessment must have written authorization and human approval.

Do not give the website a general-purpose shell and do not run Nmap, SQLMap, password auditors, or similar tools against systems you do not own or lack permission to test.
