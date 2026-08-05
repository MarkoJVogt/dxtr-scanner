export const SECRET_PATTERNS = [
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "Google API Key", regex: /AIza[0-9A-Za-z\-_]{35}/g },
  { name: "Stripe Secret Key", regex: /sk_live_[0-9a-zA-Z]{16,}/g },
  { name: "OpenAI API Key", regex: /sk-[a-zA-Z0-9]{20,}/g },
  {
    name: "Generisches Secret in Zuweisung",
    regex: /(password|secret|api[_-]?key|token)\s*[:=]\s*["'][^"'\s]{8,}["']/gi,
  },
  { name: "Private Key Block", regex: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
];

export const PII_LOG_PATTERNS = [
  { name: "console.log mit Passwort", regex: /console\.(log|debug|info)\([^)]*password[^)]*\)/gi },
  { name: "console.log mit E-Mail", regex: /console\.(log|debug|info)\([^)]*email[^)]*\)/gi },
  { name: "console.log mit Token", regex: /console\.(log|debug|info)\([^)]*token[^)]*\)/gi },
  { name: "console.log mit Session", regex: /console\.(log|debug|info)\([^)]*session[^)]*\)/gi },
];

export const AI_ACT_HIGH_RISK_PATTERNS = [
  {
    name: "Biometrische Erkennung/Klassifizierung",
    regex: /\b(face[-_]?recognition|facial[-_]?recognition|biometric(s)?|fingerprint[-_]?match|iris[-_]?scan)\b/gi,
  },
  {
    name: "Emotionserkennung",
    regex: /\b(emotion[-_]?(detection|recognition|analysis)|affect[-_]?recognition)\b/gi,
  },
  {
    name: "Bonitäts-/Risiko-Scoring",
    regex: /\b(credit[-_]?scor(e|ing)|creditworthiness|bonit(ä|ae)tspr(ü|ue)fung|risk[-_]?scor(e|ing))\b/gi,
  },
  {
    name: "Automatisierte Bewerber-/Personalauswahl",
    regex: /\b(cv[-_]?screen(ing)?|resume[-_]?screen(ing)?|candidate[-_]?scor(e|ing)|bewerber(scoring|screening|auswahl))\b/gi,
  },
  {
    name: "Social Scoring",
    regex: /\bsocial[-_]?scor(e|ing)\b/gi,
  },
  {
    name: "Strafverfolgung/Predictive Policing",
    regex: /\b(predictive[-_]?polic(e|ing)|recidivism[-_]?(risk|scor(e|ing)))\b/gi,
  },
  {
    name: "Automatisierte Entscheidung ohne erkennbare menschliche Prüfung",
    regex: /\b(auto[-_]?(approve|reject|decline)|automat(ed|ic)[-_]?decision)\b/gi,
  },
];

export const AI_ACT_GENERATIVE_PATTERNS = [
  {
    name: "Generative-KI-/Chat-Integration",
    regex: /\b(chatCompletion|chat\.completions|generateContent|ChatOpenAI|ChatAnthropic|messages\.create)\b/g,
  },
];

export const AI_ACT_RELEVANT_LIBS = new Set([
  "openai",
  "anthropic",
  "@anthropic-ai/",
  "langchain",
  "@langchain/",
  "llamaindex",
  "llama-index",
  "@huggingface/",
  "transformers",
  "sentence-transformers",
  "tensorflow",
  "@tensorflow/",
  "torch",
  "pytorch",
  "cohere-ai",
  "cohere",
  "@google/generative-ai",
  "google-generativeai",
  "replicate",
  "mistralai",
  "groq-sdk",
  "@azure/openai",
  "elevenlabs",
  "face-api.js",
]);

export const SCAN_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".py",
  ".rb",
  ".php",
  ".go",
  ".java",
  ".env",
  ".env.example",
  ".yaml",
  ".yml",
  ".json",
  ".html",
  ".htm",
]);

export const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "vendor",
  "venv",
  "__pycache__",
  ".venv",
  "coverage",
]);

export const MAX_FILE_SIZE_BYTES = 512 * 1024;
export const MAX_FILES_SCANNED = 800;
export const MAX_TOTAL_REPO_SIZE_BYTES = 150 * 1024 * 1024;
