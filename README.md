# DXTR Code-Scanner

Prototyp-Webtool, das ein öffentliches GitHub-/GitLab-Repository klont und gegen eine
Playbook-Datenbank abgleicht, um datenschutz- und KI-VO-relevante (EU AI Act) Befunde
aufzuzeigen.

Live: https://code.dxtr.de

## Was wird geprüft?

- **Secrets im Code** — hartcodierte AWS-/Google-/Stripe-/OpenAI-Keys, private Keys (`lib/patterns.js`)
- **PII-Logging** — Log-Ausgaben mit potenziell personenbezogenen Daten (E-Mail, Passwort, Token, Session)
- **`.env`-Schutz** — ob eine `.env`-Datei versehentlich mitcommittet wurde und ob `.gitignore` sie ausschließt
- **Tech-Stack / Playbook-Abgleich** — erkannte Dependencies (Firebase, Stripe, Auth0, MongoDB, Analytics-SDKs, Cloud-Provider, KI/LLM-SDKs, …) mit zugehörigen rechtlichen Prüffragen (`lib/playbookDatabase.js`)
- **EU-AI-Act-Indikatoren** — Hochrisiko-Muster nach Anhang III der KI-VO (Verordnung (EU) 2024/1689), z. B. Biometrie, Emotionserkennung, Bonitäts-/Recruiting-Scoring, Social Scoring, Predictive Policing, automatisierte Entscheidungen ohne erkennbare menschliche Prüfung, sowie generative KI-/Chat-Integrationen und KI-/LLM-Bibliotheken im Tech-Stack (`lib/patterns.js`, Sektion `ai_act` in `lib/scanner.js`)

Jeder Befund erhält eine Ampel (rot/gelb/grün) sowie eine rechtliche Prüffrage.

## Scope & Grenzen

Der Scan prüft ausschließlich den **Quellcode eines Repositories** (Muster-Erkennung,
keine Rechtsberatung). Prozesse/Abläufe, Homepages und Apps außerhalb eines Code-Repos
werden aktuell **nicht** geprüft — das ist ein offener Ausbauwunsch, siehe `STATUS.md`.

## Setup

```bash
npm install
npm start   # startet server.js auf $PORT (Default 80)
```

Erfordert `git` im `$PATH` (wird zum flachen Klonen der Ziel-Repos genutzt).

## Endpoints

- `GET /api/health` — Health-Check
- `POST /api/scan` `{ "repoUrl": "github.com/owner/repo" }` — startet einen Scan (nur `github.com`/`gitlab.com`, Rate-Limit: 3 Requests / 15 Min pro IP)

## Deployment

Containerisiert via `Dockerfile` (Node 20, `git` installiert für den Clone-Schritt).
Deployment-Ziel: Coolify → https://code.dxtr.de. Auto-Deploy bei Push ist noch nicht
eingerichtet (jeder Push braucht aktuell einen manuellen Coolify-Redeploy) — Anleitung
dafür: [`docs/coolify-auto-deploy.md`](docs/coolify-auto-deploy.md).

## Struktur

```
server.js                  Express-App, Rate-Limiting, /api/scan
lib/scanner.js             Clone, Datei-Walk, Scan-Logik, Bewertung
lib/patterns.js            Regex-Muster (Secrets, PII, EU-AI-Act)
lib/playbookDatabase.js    Dependency → Rechts-/Compliance-Hinweis
lib/repoGuard.js           URL-Validierung (nur github.com/gitlab.com)
public/                    Statisches Frontend
```
