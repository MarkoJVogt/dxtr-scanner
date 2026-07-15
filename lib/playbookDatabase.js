export const PLAYBOOK_DB = [
  {
    match: ["firebase", "firebase-admin", "@firebase/"],
    name: "Firebase",
    category: "Backend-as-a-Service",
    legalNote:
      "Google Firebase verarbeitet Daten häufig auf Servern außerhalb der EU. Prüfen: liegt ein Auftragsverarbeitungsvertrag (AVV) mit Google vor, welche Serverregion ist konfiguriert, und existiert ein geeignetes Transferinstrument (z.B. EU-US Data Privacy Framework) für den Drittlandtransfer?",
  },
  {
    match: ["stripe"],
    name: "Stripe",
    category: "Zahlungsdienstleister",
    legalNote:
      "Stripe verarbeitet Zahlungs- und Kundendaten, teils außerhalb der EU. Prüfen: AVV mit Stripe vorhanden, Serverregion/Datenresidenz-Einstellungen, und ob PCI-DSS-relevante Daten korrekt nicht selbst gespeichert werden.",
  },
  {
    match: ["openai"],
    name: "OpenAI SDK",
    category: "KI/LLM-Anbieter",
    legalNote:
      "Bei Übermittlung personenbezogener Daten an OpenAI: AVV prüfen, Serverstandort (USA), Drittlandtransfer-Instrument, sowie mögliche Pflichten nach der KI-VO (z.B. Transparenzpflichten, Risikoeinstufung je nach Anwendungsfall).",
  },
  {
    match: ["anthropic", "@anthropic-ai/"],
    name: "Anthropic SDK",
    category: "KI/LLM-Anbieter",
    legalNote:
      "Bei Übermittlung personenbezogener Daten an Anthropic: AVV prüfen, Serverstandort, Drittlandtransfer-Instrument, sowie mögliche Pflichten nach der KI-VO (z.B. Transparenzpflichten, Risikoeinstufung je nach Anwendungsfall).",
  },
  {
    match: ["twilio"],
    name: "Twilio",
    category: "Kommunikationsdienst",
    legalNote:
      "Twilio verarbeitet Telefonnummern und Nachrichteninhalte, oft mit US-Bezug. Prüfen: AVV vorhanden, Drittlandtransfer-Instrument, und ob Telefonnummern als personenbezogene Daten korrekt in der Datenschutzerklärung erfasst sind.",
  },
  {
    match: ["sendgrid", "@sendgrid/", "nodemailer"],
    name: "SendGrid / Nodemailer",
    category: "E-Mail-Versand",
    legalNote:
      "Prüfen: AVV mit dem E-Mail-Dienstleister, Serverstandort des SMTP-/API-Anbieters, und ob E-Mail-Adressen/Inhalte als personenbezogene Daten korrekt dokumentiert sind.",
  },
  {
    match: ["supabase", "@supabase/"],
    name: "Supabase",
    category: "Backend-as-a-Service",
    legalNote:
      "Prüfen: gewählte Serverregion bei Supabase (EU verfügbar?), AVV vorhanden, und Zugriffsrechte (Row Level Security) korrekt konfiguriert, um unbefugten Zugriff auf personenbezogene Daten zu verhindern.",
  },
  {
    match: ["aws-sdk", "@aws-sdk/"],
    name: "AWS SDK",
    category: "Cloud-Infrastruktur",
    legalNote:
      "Prüfen: gewählte AWS-Region (EU-Region wie eu-central-1?), AVV mit AWS vorhanden, und ob Drittlandtransfers bei Nutzung von US-Regionen oder globalen Diensten (z.B. CloudFront) sauber abgedeckt sind.",
  },
  {
    match: ["@google-cloud/", "google-cloud"],
    name: "Google Cloud",
    category: "Cloud-Infrastruktur",
    legalNote:
      "Prüfen: gewählte GCP-Region, AVV mit Google vorhanden, und Drittlandtransfer-Instrument, falls Daten außerhalb der EU verarbeitet werden.",
  },
  {
    match: ["mongodb", "mongoose"],
    name: "MongoDB / Mongoose",
    category: "Datenbank",
    legalNote:
      "Prüfen: Hosting-Standort der Datenbank (z.B. MongoDB Atlas Region), AVV mit dem Hosting-Anbieter, und ob Zugriffsrechte/Verschlüsselung angemessen konfiguriert sind.",
  },
  {
    match: ["passport", "next-auth", "auth0", "@auth0/"],
    name: "Auth-Bibliothek",
    category: "Authentifizierung",
    legalNote:
      "Prüfen: wo werden Nutzeranmeldedaten/Sessions gespeichert, welcher Anbieter (bei Auth0: US-Bezug, AVV, Drittlandtransfer), und ob Passwörter korrekt gehasht statt im Klartext verarbeitet werden.",
  },
  {
    match: ["react-ga", "react-ga4", "amplitude-js", "@amplitude/", "mixpanel-browser", "mixpanel", "posthog-js", "posthog-node"],
    name: "Analytics-SDK",
    category: "Tracking/Analytics",
    legalNote:
      "Analytics-Tools setzen häufig Cookies/IDs und übermitteln Nutzungsdaten an Drittanbieter. Prüfen: Einwilligung vor dem Setzen (Consent-Banner), AVV mit dem Anbieter, IP-Anonymisierung, und Nennung in der Datenschutzerklärung.",
  },
  {
    match: ["face-api.js", "@tensorflow-models/face-landmarks-detection", "face-recognition"],
    name: "Gesichtserkennung/Biometrie",
    category: "Biometrische Verarbeitung",
    legalNote:
      "Biometrische Daten sind eine besondere Kategorie personenbezogener Daten (Art. 9 DSGVO) und können unter die KI-VO als Hochrisiko-Anwendung fallen. Prüfen: explizite Einwilligung, Rechtsgrundlage nach Art. 9 DSGVO, und Einstufung/Pflichten nach KI-VO.",
  },
];

export function matchPlaybook(dependencyName) {
  if (!dependencyName) return null;
  const name = dependencyName.toLowerCase();
  for (const entry of PLAYBOOK_DB) {
    for (const raw of entry.match) {
      const candidate = raw.toLowerCase();
      if (candidate.endsWith("/")) {
        if (name.startsWith(candidate)) return entry;
      } else if (name === candidate) {
        return entry;
      }
    }
  }
  return null;
}
