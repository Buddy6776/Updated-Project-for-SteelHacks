"""Local, scope-enforced scanner runner for Aegis.

The hosted UI never receives shell access. This service accepts structured
actions, verifies the target against an explicit allowlist, and uses fixed
argument builders for approved tools. Mock mode is the default.
"""
import ipaddress, os, re, subprocess
from typing import Literal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Aegis scanner service", version="0.1.0")
Action = Literal["network_scan", "tls_audit", "web_scan", "osint_discovery", "sql_injection_check", "zap_baseline", "nikto_review", "technology_fingerprint", "wapiti_review", "gobuster_discovery", "wordpress_review", "waf_detection", "sslscan_review", "dirb_discovery", "feroxbuster_discovery", "joomla_review"]

class Request(BaseModel):
    action: Action
    target: str
    approved: bool = False

class CredentialAuditPlan(BaseModel):
    tool: Literal["john", "hashcat"]
    hash_type: str = Field(min_length=1, max_length=60)
    hash_count: int = Field(gt=0, le=1_000_000)
    authorization_confirmed: bool = False

class HygienePlan(BaseModel):
    target: str
    include_endpoints: bool = True
    include_identity: bool = True
    include_email: bool = True
    include_backups: bool = True
    approved: bool = False

def allowed_targets() -> set[str]:
    return {x.strip().lower() for x in os.getenv("AEGIS_ALLOWED_TARGETS", "staging.acme.test,api.staging.acme.test").split(",") if x.strip()}

def normalize_target(value: str) -> str:
    target = value.lower().strip().removeprefix("https://").removeprefix("http://").split("/")[0].split(":")[0]
    if not re.fullmatch(r"[a-z0-9.-]+", target):
        raise HTTPException(400, "Invalid target")
    try: ipaddress.ip_address(target)
    except ValueError: pass
    if target not in allowed_targets():
        raise HTTPException(403, "Target is not in the verified scope")
    return target

def command_for(action: Action, target: str) -> list[str]:
    commands = {
        "network_scan": ["nmap", "-sV", "--top-ports", "100", "--version-light", target],
        "tls_audit": ["testssl.sh", "--quiet", "--warnings", "batch", target],
        "web_scan": ["nuclei", "-u", f"https://{target}", "-severity", "low,medium,high,critical", "-jsonl"],
        "osint_discovery": ["theHarvester", "-d", target, "-b", "crtsh,otx,rapiddns"],
        "sql_injection_check": ["sqlmap", "-u", f"https://{target}", "--batch", "--smart", "--level=1", "--risk=1", "--forms", "--crawl=1"],
        "zap_baseline": ["zap-baseline.py", "-t", f"https://{target}", "-m", "3", "-I"],
        "nikto_review": ["nikto", "-h", f"https://{target}", "-maxtime", "180s", "-nointeractive"],
        "technology_fingerprint": ["whatweb", "--aggression", "1", "--no-errors", f"https://{target}"],
        "wapiti_review": ["wapiti", "-u", f"https://{target}", "--scope", "url", "--max-scan-time", "180"],
        "gobuster_discovery": ["gobuster", "dir", "-u", f"https://{target}", "-w", "/opt/aegis/wordlists/web-small.txt", "-t", "4", "--timeout", "5s", "-q"],
        "wordpress_review": ["wpscan", "--url", f"https://{target}", "--format", "json", "--max-threads", "2", "--no-banner"],
        "waf_detection": ["wafw00f", f"https://{target}", "-o", "-"],
        "sslscan_review": ["sslscan", "--no-colour", "--tlsall", f"{target}:443"],
        "dirb_discovery": ["dirb", f"https://{target}", "/opt/aegis/wordlists/web-small.txt", "-S", "-r"],
        "feroxbuster_discovery": ["feroxbuster", "--url", f"https://{target}", "--wordlist", "/opt/aegis/wordlists/web-small.txt", "--depth", "1", "--threads", "4", "--time-limit", "3m", "--silent", "--json"],
        "joomla_review": ["joomscan", "--url", f"https://{target}", "--ec"],
    }
    return commands[action]

@app.get("/health")
def health(): return {"ok": True, "mode": "live" if os.getenv("AEGIS_LIVE_SCANS") == "1" else "mock"}

@app.get("/tools")
def tools():
    return {"domain_actions": ["network_scan", "tls_audit", "web_scan", "osint_discovery", "sql_injection_check", "zap_baseline", "nikto_review", "technology_fingerprint", "wapiti_review", "gobuster_discovery", "wordpress_review", "waf_detection", "sslscan_review", "dirb_discovery", "feroxbuster_discovery", "joomla_review"], "offline_auditors": ["john", "hashcat"], "external_integrations": ["burp_suite"], "protection_modules": ["edr", "iam", "email_web_security", "backup_recovery", "cyber_hygiene"]}

@app.post("/credential-audit/plan")
def credential_audit_plan(request: CredentialAuditPlan):
    if not request.authorization_confirmed:
        raise HTTPException(409, "Written authorization for the supplied hashes is required")
    return {"tool": request.tool, "hash_type": request.hash_type, "hash_count": request.hash_count, "execution": "isolated_offline_worker", "network_access": "disabled", "requires_uploaded_hashes": True, "requires_final_approval": True}

@app.post("/hygiene/plan")
def hygiene_plan(request: HygienePlan):
    target = normalize_target(request.target)
    if not request.approved:
        raise HTTPException(409, "Explicit approval for the verified target is required")
    checks = [
        {"area": "website_network", "actions": ["network_scan", "tls_audit", "web_scan", "osint_discovery"], "execution": "scope_enforced_runner"},
        {"area": "email_web", "actions": ["spf_dkim_dmarc", "security_headers", "dns_filtering_posture"], "execution": "passive_and_connector"},
    ]
    if request.include_endpoints:
        checks.append({"area": "endpoints", "actions": ["agent_coverage", "active_alerts", "sensor_health"], "execution": "edr_connector"})
    if request.include_identity:
        checks.append({"area": "identity", "actions": ["mfa_coverage", "inactive_admins", "privilege_review"], "execution": "iam_connector"})
    if request.include_backups:
        checks.append({"area": "backup_recovery", "actions": ["backup_freshness", "restore_test_age", "isolation_posture"], "execution": "backup_connector"})
    return {"target": target, "assessment": "cyber_hygiene", "checks": checks, "scoring": "weighted_0_to_100", "requires_connected_accounts": True, "requires_human_review": True}

@app.post("/plan")
def plan(request: Request):
    target = normalize_target(request.target)
    return {"action": request.action, "target": target, "profile": "safe", "requires_approval": True, "command_preview": command_for(request.action, target)}

@app.post("/execute")
def execute(request: Request):
    target = normalize_target(request.target)
    if not request.approved: raise HTTPException(409, "Explicit approval is required")
    command = command_for(request.action, target)
    if os.getenv("AEGIS_LIVE_SCANS") != "1":
        return {"status": "mock_complete", "command": command, "output": "Safe demo completed; no packets were sent."}
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=300, check=False, env={"PATH": os.getenv("PATH", "")})
    except FileNotFoundError as exc: raise HTTPException(424, f"Approved scanner is not installed: {command[0]}") from exc
    except subprocess.TimeoutExpired as exc: raise HTTPException(408, "Scanner exceeded the five-minute limit") from exc
    return {"status": "complete", "exit_code": result.returncode, "output": result.stdout[-100_000:], "errors": result.stderr[-10_000:]}
