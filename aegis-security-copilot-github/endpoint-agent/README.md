# Aegis endpoint agent

This lightweight EDR MVP reports endpoint health to an Aegis workspace. It collects the device name, operating-system version, agent version, firewall state, disk-encryption state where supported, automatic-update state where supported, and changes to files the administrator explicitly chooses to monitor.

It does **not** accept remote commands, list or upload user files, collect credentials, hide itself, terminate processes, or automatically change device settings.

## Enroll a device

1. Sign in to Aegis and open **Endpoints**.
2. Select **Add endpoint**, name the device, and copy its enrollment credential. The credential is shown only once and authenticates future heartbeats.
3. Download this `endpoint-agent` folder to the device.
4. Test the locally collected data:

```bash
python3 aegis_agent.py --dry-run
```

5. Send one heartbeat:

```bash
python3 aegis_agent.py --server https://YOUR-AEGIS-SITE --token YOUR-ENROLLMENT-TOKEN --once
```

6. For a demo monitor, leave it running with a minimum 60-second interval:

```bash
python3 aegis_agent.py --server https://YOUR-AEGIS-SITE --token YOUR-ENROLLMENT-TOKEN
```

To monitor a critical configuration file for changes, add `--watch-path /path/to/file`. The agent uploads only a generic change alert; it never uploads the file or its contents.

For production, package the agent as a signed OS service, store the token in the operating system's secret store, use device certificates, sign updates, add a managed uninstall flow, and complete an independent security review.
