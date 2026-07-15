import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { assertValidRepoUrl } from "./repoGuard.js";
import {
  SECRET_PATTERNS,
  PII_LOG_PATTERNS,
  SCAN_EXTENSIONS,
  IGNORE_DIRS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_SCANNED,
  MAX_TOTAL_REPO_SIZE_BYTES,
} from "./patterns.js";
import { matchPlaybook } from "./playbookDatabase.js";

const execFileAsync = promisify(execFile);
const CLONE_TIMEOUT_MS = 30000;

function shouldScanFile(filePath) {
  const base = path.basename(filePath);
  if (base === ".env" || base.endsWith(".env.example")) return true;
  return SCAN_EXTENSIONS.has(path.extname(filePath));
}

async function cloneRepo(cleanUrl, targetDir) {
  try {
    await execFileAsync(
      "git",
      ["clone", "--depth", "1", "--single-branch", cleanUrl, targetDir],
      { timeout: CLONE_TIMEOUT_MS }
    );
  } catch (err) {
    if (err.killed || err.signal === "SIGTERM") {
      throw new Error("Klonen des Repositories hat das Zeitlimit (30s) überschritten.");
    }
    throw new Error("Repository konnte nicht geklont werden (existiert es und ist es öffentlich?).");
  }
}

async function walkDir(dir, baseDir, files, sizeState) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (files.length >= MAX_FILES_SCANNED) return;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      await walkDir(fullPath, baseDir, files, sizeState);
      continue;
    }

    if (!entry.isFile()) continue;

    const stat = await fs.stat(fullPath);
    sizeState.total += stat.size;
    if (sizeState.total > MAX_TOTAL_REPO_SIZE_BYTES) {
      throw new Error("Repository zu groß für Prototyp-Scan.");
    }

    if (shouldScanFile(fullPath) && stat.size <= MAX_FILE_SIZE_BYTES) {
      files.push({
        absolutePath: fullPath,
        relativePath: path.relative(baseDir, fullPath),
      });
    }
  }
}

function scanContent(content) {
  const secretHits = [];
  const piiHits = [];
  for (const { name, regex } of SECRET_PATTERNS) {
    regex.lastIndex = 0;
    if (regex.test(content)) secretHits.push(name);
  }
  for (const { name, regex } of PII_LOG_PATTERNS) {
    regex.lastIndex = 0;
    if (regex.test(content)) piiHits.push(name);
  }
  return { secretHits, piiHits };
}

async function collectDependencies(rootDir) {
  const dependencies = new Set();

  try {
    const raw = await fs.readFile(path.join(rootDir, "package.json"), "utf8");
    const pkg = JSON.parse(raw);
    for (const depName of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
      dependencies.add(depName);
    }
  } catch {
    // keine package.json - ignorieren
  }

  for (const reqFile of ["requirements.txt", "Pipfile"]) {
    try {
      const raw = await fs.readFile(path.join(rootDir, reqFile), "utf8");
      for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("[")) continue;
        const match = trimmed.match(/^([A-Za-z0-9_.-]+)/);
        if (match) dependencies.add(match[1]);
      }
    } catch {
      // Datei existiert nicht - ignorieren
    }
  }

  try {
    const raw = await fs.readFile(path.join(rootDir, "go.mod"), "utf8");
    let inRequireBlock = false;
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("require (")) {
        inRequireBlock = true;
        continue;
      }
      if (inRequireBlock && trimmed === ")") {
        inRequireBlock = false;
        continue;
      }
      if (inRequireBlock) {
        const match = trimmed.match(/^(\S+)\s+v/);
        if (match) dependencies.add(match[1]);
      } else if (trimmed.startsWith("require ")) {
        const match = trimmed.match(/^require\s+(\S+)\s+v/);
        if (match) dependencies.add(match[1]);
      }
    }
  } catch {
    // keine go.mod - ignorieren
  }

  return [...dependencies];
}

async function checkEnvProtection(rootDir) {
  let envInRoot = false;
  try {
    await fs.access(path.join(rootDir, ".env"));
    envInRoot = true;
  } catch {
    envInRoot = false;
  }

  let gitignoreExcludesEnv = false;
  try {
    const gitignore = await fs.readFile(path.join(rootDir, ".gitignore"), "utf8");
    gitignoreExcludesEnv = gitignore
      .split("\n")
      .some((l) => ["/.env", ".env", "*.env", ".env*"].includes(l.trim()));
  } catch {
    gitignoreExcludesEnv = false;
  }

  return { envInRoot, gitignoreExcludesEnv };
}

function evaluate({ secretHits, piiHits, playbookMatches, envProtection }) {
  const sections = [];

  if (secretHits.length > 0) {
    const names = [...new Set(secretHits.map((h) => h.name))];
    const fileCount = new Set(secretHits.map((h) => h.file)).size;
    sections.push({
      id: "secrets",
      title: "Mögliche Secrets im Code gefunden",
      level: "red",
      reason: `${secretHits.length} möglicher Secret-Treffer in ${fileCount} Datei(en) (${names.join(", ")}). Hartcodierte Zugangsdaten in einem öffentlichen oder später öffentlich werdenden Repository sind ein erhebliches Sicherheits- und Datenschutzrisiko.`,
      legalQuestion:
        "Wurden die betroffenen Zugangsdaten rotiert, und besteht eine Meldepflicht nach Art. 33 DSGVO, falls dadurch personenbezogene Daten zugänglich waren oder sein könnten?",
    });
  } else {
    sections.push({
      id: "secrets",
      title: "Keine offensichtlichen Secrets gefunden",
      level: "green",
      reason: "Im Rahmen der geprüften Muster wurden keine hartcodierten Zugangsdaten im Quellcode gefunden.",
      legalQuestion: null,
    });
  }

  if (piiHits.length > 0) {
    const names = [...new Set(piiHits.map((h) => h.name))];
    sections.push({
      id: "pii_logs",
      title: "Mögliches Logging personenbezogener Daten",
      level: "yellow",
      reason: `${piiHits.length} Stelle(n) mit potenziell personenbezogenen Daten in Log-Ausgaben gefunden (${names.join(", ")}). Logging von Klardaten wie Passwörtern, E-Mails oder Tokens kann gegen den Grundsatz der Datenminimierung verstoßen.`,
      legalQuestion:
        "Werden diese Logs sicher gespeichert und automatisch gelöscht, und ist das Logging als Verarbeitungstätigkeit in der Datenschutzerklärung erfasst?",
    });
  } else {
    sections.push({
      id: "pii_logs",
      title: "Kein auffälliges PII-Logging gefunden",
      level: "green",
      reason: "Im Rahmen der geprüften Muster wurden keine Log-Ausgaben mit erkennbar personenbezogenen Daten gefunden.",
      legalQuestion: null,
    });
  }

  if (envProtection.envInRoot) {
    sections.push({
      id: "env_protection",
      title: ".env-Datei im Repository eingecheckt",
      level: "red",
      reason: "Eine .env-Datei liegt im Repository-Root und wurde offenbar mitcommittet. Solche Dateien enthalten häufig Zugangsdaten und Secrets.",
      legalQuestion:
        "Enthält die eingecheckte .env-Datei personenbezogene Daten oder Zugangsdaten zu Systemen mit personenbezogenen Daten, und ist eine Meldung nach Art. 33 DSGVO erforderlich?",
    });
  } else {
    sections.push({
      id: "env_protection",
      title: ".env-Schutz unauffällig",
      level: "green",
      reason: "Es wurde keine .env-Datei im Repository-Root gefunden.",
      legalQuestion: null,
    });
  }

  if (playbookMatches.length > 0) {
    const names = playbookMatches.map((m) => m.name).join(", ");
    sections.push({
      id: "tech_stack",
      title: "Datenschutzrelevante Dienste im Tech-Stack erkannt",
      level: "yellow",
      reason: `Erkannte Dienste/Bibliotheken: ${names}. Diese Dienste verarbeiten häufig personenbezogene Daten oder übermitteln sie an Drittanbieter.`,
      legalQuestion: "Sind für alle genannten Dienste Auftragsverarbeitungsverträge vorhanden und in der Datenschutzerklärung korrekt aufgeführt?",
    });
  } else {
    sections.push({
      id: "tech_stack",
      title: "Keine bekannten datenschutzrelevanten Dienste erkannt",
      level: "green",
      reason: "Anhand der erkannten Abhängigkeiten wurden keine Treffer in der Playbook-Datenbank gefunden.",
      legalQuestion: null,
    });
  }

  return sections;
}

export async function runCodeScan(repoUrlRaw) {
  const { cleanUrl, owner, repo } = assertValidRepoUrl(repoUrlRaw);

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dxtr-scan-"));

  try {
    await cloneRepo(cleanUrl, tmpDir);

    const files = [];
    const sizeState = { total: 0 };
    await walkDir(tmpDir, tmpDir, files, sizeState);

    const secretHits = [];
    const piiHits = [];

    for (const file of files) {
      let content;
      try {
        content = await fs.readFile(file.absolutePath, "utf8");
      } catch {
        continue;
      }
      const { secretHits: sHits, piiHits: pHits } = scanContent(content);
      for (const name of sHits) secretHits.push({ name, file: file.relativePath });
      for (const name of pHits) piiHits.push({ name, file: file.relativePath });
    }

    const dependencies = await collectDependencies(tmpDir);

    const seenNames = new Set();
    const playbookMatches = [];
    for (const dep of dependencies) {
      const entry = matchPlaybook(dep);
      if (!entry || seenNames.has(entry.name)) continue;
      seenNames.add(entry.name);
      playbookMatches.push({ name: entry.name, category: entry.category, legalNote: entry.legalNote });
    }

    const envProtection = await checkEnvProtection(tmpDir);

    const evaluation = evaluate({ secretHits, piiHits, playbookMatches, envProtection });

    return {
      repo: `${owner}/${repo}`,
      scannedAt: new Date().toISOString(),
      filesScanned: files.length,
      findings: {
        dependencies,
        playbookMatches,
        secretFindings: secretHits,
        piiLogFindings: piiHits,
        envProtection,
      },
      evaluation,
    };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}
