**Projekt:** DXTR Code-Scanner
**Chief:** Chief Infrastruktur (vorläufig zugeordnet, weiterhin zu bestätigen)
**Stand:** 03.08.2026
**Ampel:** 🟢 läuft

## Kurzzusammenfassung
Node/Express-Webtool (`server.js`), das ein Code-Repo scannt und Ergebnisse gegen eine Playbook-Datenbank (`lib/playbookDatabase.js`, `lib/patterns.js`, `lib/repoGuard.js`) abgleicht. Statisches Frontend unter `public/`, Endpoint `/api/scan`, Rate-Limit 3 Requests/15min pro IP, Deployment via Dockerfile. Live unter https://code.dxtr.de (HTTP 200, `/api/health` antwortet).

## Seit letztem Report erledigt
- Lokaler Ordner ist inzwischen an GitHub angebunden (`.git` vorhanden, `origin` zeigt korrekt auf `MarkoJVogt/dxtr-scanner`) — der zuvor gemeldete Blocker ("kein .git-Verzeichnis") ist damit gelöst.

## In Arbeit
- Untracked `package-lock.json` liegt lokal (nicht committed — vermutlich aus lokalem `npm install`), unkritisch.
- Coolify-Redeploy noch zu prüfen: falls kein Auto-Deploy-Webhook eingerichtet ist, muss der neue Commit manuell in Coolify deployt werden, damit die Verbesserung auch live auf code.dxtr.de ankommt.

## Blocker / offene Entscheidungen für Marko
- Chief-Zuordnung "Infrastruktur" weiterhin nur eine Annahme, nicht bestätigt.
- Kein Coolify-App-Eintrag hier dokumentiert, obwohl das Tool nachweislich unter code.dxtr.de live läuft — Registry-Abgleich empfohlen.

## Nächste Schritte
- Prüfen, ob code.dxtr.de nach dem Push automatisch neu deployt oder ein manueller Coolify-Trigger nötig ist.
- README/Repo-Beschreibung auf GitHub ergänzen (weiterhin leer).
- Deployment-Ziel/Coolify-Eintrag formal in der Registry nachtragen (Tool läuft nachweislich, nur nicht dokumentiert wo).

## Anweisung vom Masterchief (26.07.2026)
- ✅ erledigt am 26.07.2026 — "In Arbeit" und "Nächste Schritte" oben ausgefüllt, auf Basis von GitHub-API-Check (Commits, Issues, PRs) statt Vermutung.

## Anweisung vom Masterchief (03.08.2026)
- Live-Status verifiziert (HTTP 200 + /api/health), Git-Anbindung bestätigt, zwei uncommittete lokale Änderungen gefunden, geprüft und oben dokumentiert. Committen/Pushen bewusst nicht selbst vorgenommen, da keine explizite Freigabe dafür vorliegt.

## Anweisung vom Masterchief (03.08.2026, Nachtrag)
- **Marko hat den Push freigegeben** ("push", in Reaktion auf den Masterchief-Report vom 03.08.2026). Commit `930f741` erstellt und nach `origin/main` gepusht. Coolify-Redeploy-Status nicht geprüft (kein Coolify-Zugang in dieser Session) — bitte code.dxtr.de nach Redeploy gegenchecken, ob die bare-Hostname/www-Verbesserung live ist.

## Anweisung vom Masterchief (04.08.2026)
- Marko hat nachgefragt, ob der Scan auch den EU AI Act einbezieht — Prüfung ergab: aktuell **nein**. `lib/patterns.js` deckt nur Secrets (AWS/Google/Stripe/OpenAI Keys, private Keys) und PII-in-Logs ab; keine Compliance- oder AI-Act-Prüfung vorhanden.
- **Anforderung von Marko:** Das Tool muss explizit auf EU-AI-Act-Konformität prüfen. Zusätzlich soll der Scope über reines Code-Scanning hinausgehen und auch **Abläufe/Prozesse, Homepages und Apps** auf Compliance und EU-AI-Act-Konformität prüfen (nicht nur Source-Code-Repos).
- **Nächster Schritt für den zuständigen Chief:** Konzept erarbeiten, wie EU-AI-Act-Konformitätsprüfung (z. B. Risikoklassifizierung von KI-Komponenten, Transparenzpflichten, Kennzeichnungspflichten) sowie Prozess-/Homepage-/App-Scans (nicht nur Repo-Scans) technisch und rechtlich sauber umgesetzt werden können, und Vorschlag zur Rückmeldung an Marko vorlegen.

## Links
- Systemkarte-Eintrag: Abschnitt 07 — Weitere GitHub-Repos
- Live: https://code.dxtr.de
- Repo: https://github.com/MarkoJVogt/dxtr-scanner (öffentlich)
