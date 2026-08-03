const ALLOWED_HOSTS = new Set(["github.com", "gitlab.com"]);
const SAFE_SEGMENT = /^[a-zA-Z0-9_.-]+$/;

export function assertValidRepoUrl(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
    throw new Error("Bitte eine Repository-URL angeben.");
  }

  let normalized = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("Das ist keine gültige URL.");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Nur https://-URLs sind erlaubt.");
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!ALLOWED_HOSTS.has(host)) {
    throw new Error("Nur Repositories auf github.com oder gitlab.com sind erlaubt.");
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new Error("Die URL muss auf ein Repository im Format owner/repo verweisen.");
  }

  const [ownerRaw, repoRaw] = segments;
  const owner = ownerRaw.replace(/[^a-zA-Z0-9_.-]/g, "");
  const repo = repoRaw.replace(/[^a-zA-Z0-9_.-]/g, "").replace(/\.git$/i, "");

  if (!owner || !SAFE_SEGMENT.test(owner)) {
    throw new Error("Der Owner-Name in der URL ist ungültig.");
  }
  if (!repo || !SAFE_SEGMENT.test(repo)) {
    throw new Error("Der Repository-Name in der URL ist ungültig.");
  }

  return {
    cleanUrl: `https://${host}/${owner}/${repo}.git`,
    owner,
    repo,
  };
}
