# 🎁 Wichteln / Engerl-Bengerl

A zero-dependency, security-hardened **Secret Santa ("Wichteln")** and **Team Secret Santa ("Engerl-Bengerl")** web application.

* **Backend (`server.toit`, `solver.toit`, `smtp.toit`):** Written in **Toit v2.0** using only the built-in standard library (`net`, `tls`, `io`, `encoding.json`, `encoding.base64`, `crypto.sha256`). Compiles to a single standalone Linux executable (`wichteln-server`) with zero third-party packages.
* **Frontend (`public/`):** Zero-build Vanilla JavaScript (ES Modules), semantic HTML5, modern CSS (automatic light/dark mode), and **IndexedDB** for local preset storage.

---

## ✨ Features

* **Configurable Team Size ($k$):**
  * $k = 1$: Classic 1-on-1 Secret Santa / Wichteln.
  * $k = 2$: Team Engerl-Bengerl (2 givers team up to buy 1 gift for 1 receiver; each person participates in 2 giving teams).
  * $k \ge 3$: Generalized $k$-giver teams.
* **Two-Way (`↔`) & One-Way (`→`) Exclusions:**
  * Zero-typing participant exclusion picker right in the table.
  * Supports mutual exclusions (e.g., couples who should neither gift each other nor be placed on the same giving team) and directed one-way exclusions ($A \not\to B$).
* **Graph & Secrecy Constraints:**
  * Prevents duplicate co-giver teams ($\{A, B\}$ teaming up twice for different receivers).
  * Prevents direct reciprocity ($A \leftrightarrow B$).
  * **Dry-Run Mode with Uniqueness & Secrecy Analysis:** Deduplicates sample draws via backtracking and warns if tight constraints leave only 1 valid solution (or force specific receivers to always get the same givers).
* **Anti-Spam-Relay Hardening:**
  * Email templates (`de`, `en`, extensible) are locked on the server in `config.json`—clients cannot submit arbitrary email body text.
  * Participant names are optional (falling back to the email address) and strictly validated to reject URLs, header-injection characters, or control characters.
  * Live email dispatch requires a server passcode (verified in constant time via SHA-256) and is rate-limited in memory.
  * Real draw results are **never** returned in the HTTP response when sending emails, keeping the draw secret even from the organizer.

---

## 🛠️ Building & Running Locally

### Prerequisites
* [Toit SDK v2.0.0+](https://github.com/toitlang/toit/releases)

### Commands
```bash
# Run static analysis
make analyze

# Run unit tests
make test

# Run directly in development (listens on http://127.0.0.1:8080)
make run

# Compile standalone native binary (./wichteln-server)
make build
```

---

## 🚀 Deploying the Backend

Because `wichteln-server` compiles to a self-contained binary and preloads the allowlisted frontend files (`public/`) into memory at startup, deployment requires only the binary, the `public/` folder, and your `config.json`.

### 1. Prepare the Server Directory
Copy the compiled `wichteln-server` binary (from `make build` or the GitHub Actions CI artifact), `public/`, and `config.json` to your server:

```bash
sudo mkdir -p /opt/wichteln
sudo cp -r wichteln-server public config.json /opt/wichteln/
sudo chmod 755 /opt/wichteln/wichteln-server
sudo chmod 600 /opt/wichteln/config.json
```

### 2. Configure `/opt/wichteln/config.json`
Edit `/opt/wichteln/config.json` with a strong `passcode` and your SMTP credentials:

```json
{
  "port": 8080,
  "passcode": "your-long-random-passcode",
  "smtp": {
    "host": "smtp.example.org",
    "port": 587,
    "tlsMode": "starttls",
    "username": "wichteln@example.org",
    "password": "smtp-app-password",
    "fromEmail": "wichteln@example.org",
    "fromName": "Wichteln / Engerl-Bengerl",
    "heloDomain": "example.org",
    "skipCertificateValidation": false
  },
  "templates": {
    "de": {
      "label": "Deutsch",
      "subject": "Engerl-Bengerl / Wichteln",
      "body": "Hallo {{giver_name}},\n\n{{assignments}}\n\nFrohes Wichteln!",
      "singleAssignment": "Du beschenkst: {{receiver}}",
      "teamAssignment": "Du beschenkst zusammen mit {{co_givers}}: {{receiver}}",
      "coGiverJoiner": ", "
    },
    "en": {
      "label": "English",
      "subject": "Secret Santa Assignment",
      "body": "Hello {{giver_name}},\n\n{{assignments}}\n\nHappy Secret Santa!",
      "singleAssignment": "You are gifting: {{receiver}}",
      "teamAssignment": "Together with {{co_givers}}, you are gifting: {{receiver}}",
      "coGiverJoiner": ", "
    }
  }
}
```
*Supported `tlsMode` values:* `"starttls"` (port 587), `"smtps"` (implicit TLS, port 465), or `"plain"` (port 25 / local relay).

### 3. Create a `systemd` Service
Create `/etc/systemd/system/wichteln.service`:

```ini
[Unit]
Description=Wichteln / Engerl-Bengerl Server
After=network.target

[Service]
Type=simple
DynamicUser=yes
WorkingDirectory=/opt/wichteln
ExecStart=/opt/wichteln/wichteln-server /opt/wichteln/config.json /opt/wichteln/public
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now wichteln.service
sudo systemctl status wichteln.service
```

### 4. Expose via Cloudflare Tunnel (Optional)
Point your `cloudflared` tunnel ingress to `http://127.0.0.1:8080`:

```yaml
ingress:
  - hostname: wichteln.yourdomain.tld
    service: http://127.0.0.1:8080
  - service: http_status:404
```

---

## 📡 HTTP API Overview

* `GET /api/meta` — Returns available language codes from `config.json` and validation limits.
* `POST /api/draw` — Validates participants & rules, runs the solver, and either:
  * **`dryRun: true`**: Returns deduplicated sample draws, rendered email previews, and uniqueness/secrecy metadata (`onlyOneSolutionExists`, `exhaustedAllSolutions`, `forcedReceivers`).
  * **`dryRun: false`**: Verifies `passcode`, computes a fresh secret draw, sends the emails via SMTP, and returns `{ "ok": true, "dryRun": false, "sentCount": N }`.

---

## 📄 License

Licensed under the [Apache License, Version 2.0](LICENSE).
