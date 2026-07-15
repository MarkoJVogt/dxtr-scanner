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

export const SCAN_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
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
