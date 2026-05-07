export interface WebsiteAlias {
  aliases: string[];
  url: string;
}

export function getWebsiteUrl(value: string, aliases: WebsiteAlias[] = []): string | null {
  const normalized = normalizeAlias(value);
  const match = aliases.find((alias) => alias.aliases.some((item) => normalizeAlias(item) === normalized));
  if (match) return getWebsiteUrl(match.url);

  if (/\s/.test(value)) return null;

  const hasScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(value);
  const candidate = hasScheme ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (hasScheme && !/^https?:\/\//i.test(value)) return null;
    if (!isWebsiteHost(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function isWebsiteHost(hostname: string): boolean {
  if (hostname === "localhost") return true;
  if (isIPv4Host(hostname)) return true;

  const parts = hostname.split(".");
  const topLevelDomain = parts.at(-1) ?? "";
  return parts.length > 1 && /^[a-z]{2,}$/i.test(topLevelDomain);
}

function isIPv4Host(hostname: string): boolean {
  const parts = hostname.split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

function normalizeAlias(value: string): string {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}
