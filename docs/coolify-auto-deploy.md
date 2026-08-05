# Coolify Auto-Deploy einrichten

**Status: ✅ eingerichtet am 05.08.2026.** `git push` auf `main` löst jetzt automatisch
einen Redeploy von code.dxtr.de aus — kein manueller Klick in Coolify mehr nötig.
Verifiziert mit Commit `d02abe3` (leerer Test-Commit): GitHub-Zustellung `200`, Coolify
hat innerhalb von ~30 Sekunden automatisch neu gebaut. Der Rest dieser Seite bleibt als
Referenz stehen — z. B. falls der Webhook mal neu angelegt werden muss oder als Vorlage
für andere Apps auf demselben Server.

**Was eingerichtet wurde:** Coolifys "Auto Deploy"-Schalter war schon aktiv (Weg A
teilweise vorbereitet). Der GitHub-Webhook (Weg B) fehlte noch und wurde per `gh api`
angelegt: Payload-URL `http://178.105.170.226:8000/webhooks/source/github/events/manual`,
Event `push`, Secret aus Coolifys Webhooks-Seite übernommen (GitHub-Hook-ID `661653130`).

**Voraussetzung:** Zugriff auf das Coolify-Dashboard für diese App sowie Admin-Rechte
auf `github.com/MarkoJVogt/dxtr-scanner` (Settings → Webhooks). Beides hat aktuell nur
Marko; die Coolify-URL selbst ist noch nirgends dokumentiert (offener Punkt in der
Systemkarte, Abschnitt Fundstellen).

**Falls der Coolify-Login blockiert ist** (Passwort unbekannt oder IP-Zugriffslogik
verweigert den Login — ist am 05.08.2026 so aufgetreten): per SSH auf den Hetzner-Server
(`ssh root@178.105.170.226`), dann Root-Passwort direkt im Coolify-Container zurücksetzen:

```bash
docker exec -ti coolify sh -c "php artisan root:reset-password"
# bei Bedarf zusätzlich:
docker exec -ti coolify sh -c "php artisan root:change-email"
```

Quelle: [Coolify Docs — Commands](https://coolify.io/docs/knowledge-base/commands).

Zwei Wege — Weg A ist vorzuziehen, wenn die Coolify-Instanz bereits eine GitHub-App
verbunden hat (dann oft schon aktiv, nur zu prüfen); sonst Weg B.

## Weg A: GitHub App (empfohlen, wenn schon eingerichtet)

Coolify aktiviert "Auto Deploy" bei GitHub-App-Anbindung meist automatisch. Nur prüfen:

1. Coolify → dxtr-scanner-App → **Configuration → Advanced**
2. Ist der Schalter **"Auto Deploy"** an? Falls ja: schon erledigt, nur noch verifizieren
   (siehe "Verifizieren" unten).
3. Falls die App noch nicht über eine GitHub App verbunden ist, ist der Aufwand größer
   als Weg B (GitHub App muss erst in Coolify unter Sources eingerichtet werden) — in
   dem Fall direkt mit Weg B fortfahren, das ist der schnellere Pfad für ein einzelnes Repo.

## Weg B: Manueller Webhook

**1. Auto Deploy in Coolify aktivieren**
- App-Konfiguration → **Advanced** → Schalter **"Auto Deploy"** einschalten.

**2. Webhook-Secret setzen**
- Ein zufälliges Secret generieren (z. B. `openssl rand -hex 32`).
- In das Coolify-Feld für das Webhook-Secret eintragen und speichern.
- Coolify zeigt danach eine **Webhook-URL** an — die für Schritt 3 kopieren.

**3. Webhook in GitHub registrieren**
- `github.com/MarkoJVogt/dxtr-scanner` → **Settings → Webhooks → Add webhook**
- **Payload URL:** die Coolify-Webhook-URL aus Schritt 2
- **Content type:** `application/json`
- **Secret:** das gleiche Secret wie in Schritt 2
- SSL-Verifizierung aktiviert lassen
- **"Which events...":** nur **`push`** auswählen (nicht "Send me everything")
- **Add webhook**

## Verifizieren

Nach der Einrichtung: einen leeren Commit pushen und prüfen, ob Coolify automatisch
baut, z. B.

```bash
git commit --allow-empty -m "chore: trigger auto-deploy test"
git push origin main
```

Dann in Coolify den Deployment-Log der App prüfen (sollte kurz nach dem Push starten),
und/oder auf GitHub unter dem Webhook **"Recent Deliveries"** auf eine `200`-Antwort
von Coolify prüfen.

Danach live bestätigen, dass der neue Stand ausgeliefert wird, z. B. per `Last-Modified`-
Header-Vergleich vor/nach dem Push:

```bash
curl -sI https://code.dxtr.de/ | grep -i last-modified
```

## Quellen
- [Coolify Docs — GitHub Auto Deploy](https://coolify.io/docs/applications/ci-cd/github/auto-deploy)
- [Coolify Docs — GitHub Integration](https://docs.coolify.codeon.cn/en/knowledge-base/git/github/integration)
