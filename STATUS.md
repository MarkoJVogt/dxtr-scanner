**Projekt:** DXTR Code-Scanner
**Chief:** Chief Infrastruktur (vorläufig zugeordnet, weiterhin zu bestätigen)
**Stand:** 05.08.2026
**Ampel:** 🟢 läuft

## Kurzzusammenfassung
Node/Express-Webtool (`server.js`), das ein Code-Repo scannt und Ergebnisse gegen eine Playbook-Datenbank (`lib/playbookDatabase.js`, `lib/patterns.js`, `lib/repoGuard.js`) abgleicht — inkl. EU-AI-Act-Indikatoren (s. "Erledigt (05.08.2026)"). Statisches Frontend unter `public/`, Endpoint `/api/scan`, Rate-Limit 3 Requests/15min pro IP, Deployment via Dockerfile. Live unter https://code.dxtr.de (Stand 03.08.: HTTP 200, `/api/health` antwortet — seither nicht erneut geprüft).

## Nächste Schritte
- Deployment-Ziel/Coolify-Eintrag formal in der Registry nachtragen (Tool läuft nachweislich, nur nicht dokumentiert wo).
- Konzept für Scope-Erweiterung (Prozesse/Homepages/Apps, s. Anweisung 04.08.) noch zu erarbeiten.

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

## Erledigt (05.08.2026, Nachtrag)
- **Auto-Deploy eingerichtet und mit echtem Push verifiziert:** Coolifys "Auto Deploy"-Schalter war schon aktiv; GitHub-Webhook fehlte noch und wurde per `gh api` angelegt (Payload-URL `http://178.105.170.226:8000/webhooks/source/github/events/manual`, Event `push`, Secret aus Coolifys Webhooks-Seite übernommen). Test mit leerem Commit (`d02abe3`): GitHub-Zustellung `200`, Coolify hat automatisch redeployt (`Last-Modified` sprang < 30 Sek. nach Push, ohne manuellen Klick). Künftige Pushes auf `main` deployen jetzt automatisch.
- **Zwei vom Review gemeldete Scanner-Bugs behoben** (Commit `8a78444`, live verifiziert via `filesScanned` am eigenen Repo: 6→7 nach Fix): `SCAN_EXTENSIONS` fehlten `.mts/.cts/.mjs/.cjs/.html` (TypeScript-ESM-Module und HTML wurden komplett übersprungen — Ursache für die "14 gescannte Dateien" im Review); `PLAYBOOK_DB` fehlten Resend, Netlify (`@netlify/functions`), Neon (`@neondatabase/serverless`) — die vom Review als übersehene Drittanbieter genannten Services. Vercel und Upstash als naheliegende Ergänzung mit aufgenommen.
- Bekannte, nicht behobene Einschränkung (aus dem gleichen Review, nicht Teil des Auftrags): `collectDependencies` liest nur die Root-`package.json` — Monorepos mit Dependencies in Unterordnern werden nicht erfasst (bei Test gegen `resend/resend-examples` aufgefallen: 0 Dependencies trotz 556 gescannter Dateien).

## Erledigt (05.08.2026)
- **EU-AI-Act-Scan für Repos implementiert, gepusht und live** (Commits `b29a79d`, `db93e71`, `36d96dc` — Marko hat den Push freigegeben): `lib/patterns.js` enthält jetzt Hochrisiko-Muster nach Anhang III KI-VO (Biometrie, Emotionserkennung, Bonitäts-/Bewerber-Scoring, Social Scoring, Predictive Policing, automatisierte Entscheidungen), generative-KI-Nutzungsmuster sowie eine Liste KI-relevanter Bibliotheken (OpenAI, Anthropic, LangChain, Hugging Face, TensorFlow/PyTorch, u. a.). `lib/playbookDatabase.js` kategorisiert KI/LLM-SDKs neu als "KI-System (EU-AI-Act-relevant)" mit Verweisen auf Art. 6/Anhang III und Art. 50 KI-VO. `lib/scanner.js` wertet das als eigene rot/gelb/grün-Sektion (`ai_act`), `public/index.html` zeigt die Treffer an. End-to-End gegen `github.com/openai/openai-node` getestet (641 Dateien, generative Treffer korrekt erkannt, Sektion rendert gelb).
- **Coolify-Redeploy durch Marko ausgelöst und live verifiziert** (05.08., 09:14 UTC): `Last-Modified`-Header und Untertitel auf code.dxtr.de bestätigen den neuen Stand ("...EU-AI-Act-Indikatoren."). Dabei aufgefallen: Coolify-Login war blockiert (Root-Passwort unbekannt/IP-Zugriffslogik) — behoben per SSH auf den Hetzner-Server (`178.105.170.226`) mit `docker exec -ti coolify sh -c "php artisan root:reset-password"`.
- **Scope-Einschränkung weiterhin offen:** Die Erweiterung auf Prozesse/Abläufe, Homepages und Apps (nicht nur Repos) ist **nicht** umgesetzt — das bleibt ein separates, größeres Konzept-Thema und wurde bewusst nicht in diesem Schritt mit angegangen.
- **README.md ergänzt** (war leer) — Kurzbeschreibung, Scope/Grenzen, Setup, Endpoints, Struktur.
- **GitHub-Repo-Beschreibung gesetzt** (war leer, Marko hat zugestimmt): "Prototyp-Webtool: scannt öffentliche GitHub/GitLab-Repos auf Secrets, PII-Logging, Tech-Stack-Compliance und EU-AI-Act-Indikatoren."
- `package-lock.json` in `.gitignore` aufgenommen (war seit Commit `8a4b3d4` bewusst untracked, tauchte aber immer wieder als offene Änderung auf — jetzt sauber ausgeschlossen statt dauerhaftes "unkritisches" Rauschen).
- **Coolify-Zugriffsproblem dokumentiert** in [`docs/coolify-auto-deploy.md`](docs/coolify-auto-deploy.md) als Kontext für den nächsten Schritt (Auto-Deploy), damit die Passwort-Reset-Prozedur nicht neu recherchiert werden muss, falls der Zugang wieder verloren geht.

## Blocker / offene Entscheidungen für Marko
- Chief-Zuordnung "Infrastruktur" weiterhin nur eine Annahme, nicht bestätigt (unverändert seit 26.07.).

## Links
- Systemkarte-Eintrag: Abschnitt 07 — Weitere GitHub-Repos
- Live: https://code.dxtr.de
- Repo: https://github.com/MarkoJVogt/dxtr-scanner (öffentlich)
