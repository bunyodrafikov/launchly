import type { TileDefinition } from "../types";
import type { WebsiteAlias } from "./url";

export type SearchSuggestionKind = "bookmark" | "common" | "history";

export interface SearchSuggestion {
  id: string;
  kind: SearchSuggestionKind;
  title: string;
  subtitle: string;
  value: string;
  url?: string;
  icon?: string;
  aliases: string[];
}

export interface SearchHistoryEntry {
  title: string;
  subtitle: string;
  value: string;
  url?: string;
  icon?: string;
}

export const COMMON_SITE_SUGGESTIONS: SearchSuggestion[] = [
  commonSite("github", "GitHub", "github.com", "https://github.com", ["git"]),
  commonSite("gmail", "Gmail", "mail.google.com", "https://mail.google.com", ["mail", "google mail"]),
  commonSite("youtube", "YouTube", "youtube.com", "https://youtube.com", ["yt"]),
  commonSite("google-docs", "Google Docs", "docs.google.com", "https://docs.google.com", ["docs", "google docs"]),
  commonSite("google-drive", "Google Drive", "drive.google.com", "https://drive.google.com", ["drive", "google drive"]),
  commonSite("jira", "Jira", "atlassian.com", "https://jira.com", ["atlassian"]),
  commonSite("bitbucket", "Bitbucket", "bitbucket.org", "https://bitbucket.org", ["bb"]),
  commonSite("confluence", "Confluence", "atlassian.com", "https://www.atlassian.com/software/confluence", ["wiki"]),
  commonSite("slack", "Slack", "app.slack.com", "https://app.slack.com", []),
  commonSite("figma", "Figma", "figma.com", "https://figma.com", []),
  commonSite("notion", "Notion", "notion.so", "https://notion.so", []),
  commonSite("linear", "Linear", "linear.app", "https://linear.app", []),
  commonSite("chatgpt", "ChatGPT", "chatgpt.com", "https://chatgpt.com", ["gpt"]),
  commonSite("perplexity", "Perplexity", "perplexity.ai", "https://www.perplexity.ai", []),
  commonSite("spotify", "Spotify", "open.spotify.com", "https://open.spotify.com", [])
];

export function getBookmarkSuggestions(tiles: TileDefinition[]): SearchSuggestion[] {
  return tiles
    .filter((tile) => tile.kind === "bookmark" && tile.href)
    .map((tile) => {
      const domain = getDomainLabel(tile.href ?? "") ?? tile.subtitle ?? "";
      const title = tile.title.replace(/\s+/g, " ").trim();
      return {
        id: `bookmark:${tile.id}`,
        kind: "bookmark",
        title,
        subtitle: tile.subtitle ?? domain,
        value: title,
        url: tile.href,
        icon: tile.icon,
        aliases: compactUnique([tile.id, title, tile.subtitle, domain])
      };
    });
}

export function getHistorySuggestions(entries: SearchHistoryEntry[]): SearchSuggestion[] {
  return entries.map((entry, index) => ({
    id: `history:${index}:${entry.value}`,
    kind: "history",
    title: entry.title,
    subtitle: entry.subtitle,
    value: entry.value,
    url: entry.url,
    icon: entry.icon,
    aliases: compactUnique([entry.title, entry.subtitle, entry.value])
  }));
}

export function getSearchSuggestions(query: string, sources: SearchSuggestion[], limit = 6): SearchSuggestion[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return sources.slice(0, limit);

  return sources
    .map((suggestion, index) => ({ suggestion, index, score: scoreSuggestion(suggestion, normalizedQuery) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.suggestion);
}

export function getWebsiteAliases(suggestions: SearchSuggestion[]): WebsiteAlias[] {
  return suggestions
    .filter((suggestion) => Boolean(suggestion.url))
    .map((suggestion) => ({
      aliases: suggestion.aliases,
      url: suggestion.url ?? ""
    }));
}

export function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function commonSite(id: string, title: string, subtitle: string, url: string, aliases: string[]): SearchSuggestion {
  return {
    id: `common:${id}`,
    kind: "common",
    title,
    subtitle,
    value: title,
    url,
    icon: `https://www.google.com/s2/favicons?domain=${subtitle}&sz=64`,
    aliases: compactUnique([id, title, subtitle, ...aliases])
  };
}

function scoreSuggestion(suggestion: SearchSuggestion, query: string): number {
  const fields = [suggestion.title, suggestion.subtitle, suggestion.value, ...suggestion.aliases].map(normalizeSearchText);
  if (fields.some((field) => field === query)) return 100;
  if (fields.some((field) => field.startsWith(query))) return 70;
  if (fields.some((field) => field.includes(query))) return 35;
  return 0;
}

function getDomainLabel(value: string): string | null {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function compactUnique(values: Array<string | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}
