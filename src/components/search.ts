import { tiles } from "@config/tiles";
import { userSettings } from "@config/settings";
import {
  COMMON_SITE_SUGGESTIONS,
  getBookmarkSuggestions,
  getHistorySuggestions,
  getSearchSuggestions,
  getWebsiteAliases,
  normalizeSearchText,
  type SearchHistoryEntry,
  type SearchSuggestion
} from "../services/search-suggestions";
import { getWebsiteUrl } from "../services/url";
import type { SearchEngineId } from "../types";

interface Engine {
  id: SearchEngineId;
  name: string;
  url: string;
  icon: string;
}

export const ENGINES: Engine[] = [
  {
    id: "google",
    name: "Google",
    url: "https://www.google.com/search?q=",
    icon: "https://www.google.com/s2/favicons?domain=google.com&sz=64"
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    icon: "https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=64"
  },
  {
    id: "perplexity",
    name: "Perplexity",
    url: "https://www.perplexity.ai/search?q=",
    icon: "https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64"
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chatgpt.com/?q=",
    icon: "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64"
  }
];

const STORAGE_KEY = "launchly.searchEngine";
const HISTORY_STORAGE_KEY = "launchly.searchHistory";
const MAX_HISTORY_ITEMS = 12;

function getActiveEngine(): Engine {
  const saved = localStorage.getItem(STORAGE_KEY) as SearchEngineId | null;
  const defaultId = userSettings.defaultSearchEngine ?? "google";
  const id = saved ?? defaultId;
  return ENGINES.find((e) => e.id === id) ?? ENGINES[0];
}

export function renderSearch(): string {
  const engine = getActiveEngine();
  const menuItems = ENGINES.map(
    (e) => `
    <li class="search-engine-option${e.id === engine.id ? " is-active" : ""}" role="option" data-engine="${e.id}" aria-selected="${e.id === engine.id}">
      <img src="${e.icon}" alt="" class="search-engine-option-icon" draggable="false" />
      <span>${e.name}</span>
    </li>`
  ).join("");

  return `
    <form class="search" id="searchForm" role="search">
      <div class="search-engine-wrap">
        <button type="button" class="search-engine" id="searchEngineBtn" aria-haspopup="listbox" aria-expanded="false" aria-label="Change search engine">
          <img src="${engine.icon}" alt="${engine.name}" class="search-engine-icon" id="searchEngineIcon" draggable="false" />
          <svg class="search-engine-caret" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <ul class="search-engine-menu" id="searchEngineMenu" role="listbox" aria-label="Search engine" hidden>
          ${menuItems}
        </ul>
      </div>
      <input
        class="search-input"
        id="searchInput"
        type="search"
        autofocus
        autocomplete="off"
        spellcheck="false"
        placeholder="Search ${engine.name}"
        aria-label="Search"
        aria-autocomplete="list"
        aria-controls="searchSuggestions"
        aria-expanded="false"
      />
      <button type="submit" class="search-submit" aria-label="Search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>
      <ul class="search-suggestions" id="searchSuggestions" role="listbox" aria-label="Search suggestions" hidden></ul>
    </form>
  `;
}

export function wireSearch(): void {
  const form = document.getElementById("searchForm") as HTMLFormElement | null;
  const input = document.getElementById("searchInput") as HTMLInputElement | null;
  const engineBtn = document.getElementById("searchEngineBtn") as HTMLButtonElement | null;
  const engineIcon = document.getElementById("searchEngineIcon") as HTMLImageElement | null;
  const menu = document.getElementById("searchEngineMenu") as HTMLUListElement | null;
  const suggestionsMenu = document.getElementById("searchSuggestions") as HTMLUListElement | null;

  if (!form || !input || !engineBtn || !engineIcon || !menu || !suggestionsMenu) return;

  let active = getActiveEngine();
  let activeSuggestionIndex = -1;
  let visibleSuggestions: SearchSuggestion[] = [];
  let suggestionDraft = "";
  let previewedSuggestion: SearchSuggestion | undefined;
  let history = readSearchHistory();

  function getSources(): SearchSuggestion[] {
    return [
      ...getHistorySuggestions(history),
      ...getBookmarkSuggestions(tiles),
      ...COMMON_SITE_SUGGESTIONS
    ];
  }

  function applyEngine(engine: Engine): void {
    active = engine;
    engineIcon!.src = engine.icon;
    engineIcon!.alt = engine.name;
    input!.placeholder = `Search ${engine.name}`;
    menu!.querySelectorAll<HTMLLIElement>("[data-engine]").forEach((li) => {
      const selected = li.dataset.engine === engine.id;
      li.classList.toggle("is-active", selected);
      li.setAttribute("aria-selected", String(selected));
    });
    localStorage.setItem(STORAGE_KEY, engine.id);
  }

  function openMenu(): void {
    menu!.hidden = false;
    engineBtn!.setAttribute("aria-expanded", "true");
  }

  function closeMenu(): void {
    menu!.hidden = true;
    engineBtn!.setAttribute("aria-expanded", "false");
  }

  function openSuggestions(): void {
    suggestionsMenu!.hidden = false;
    input!.setAttribute("aria-expanded", "true");
  }

  function closeSuggestions(): void {
    suggestionsMenu!.hidden = true;
    input!.setAttribute("aria-expanded", "false");
    input!.removeAttribute("aria-activedescendant");
    activeSuggestionIndex = -1;
    previewedSuggestion = undefined;
  }

  function renderSuggestions(showDefault = false): void {
    if (!input!.value.trim() && !showDefault) {
      visibleSuggestions = [];
      suggestionsMenu!.innerHTML = "";
      suggestionDraft = "";
      previewedSuggestion = undefined;
      closeSuggestions();
      return;
    }

    suggestionDraft = input!.value;
    previewedSuggestion = undefined;
    visibleSuggestions = getSearchSuggestions(input!.value, getSources());
    activeSuggestionIndex = -1;
    suggestionsMenu!.innerHTML = visibleSuggestions.map((suggestion, index) => renderSuggestion(suggestion, index)).join("");
    if (visibleSuggestions.length > 0) {
      openSuggestions();
      syncActiveSuggestion();
    } else {
      closeSuggestions();
    }
  }

  function syncActiveSuggestion(): void {
    suggestionsMenu!.querySelectorAll<HTMLLIElement>("[data-suggestion-index]").forEach((li) => {
      const selected = Number(li.dataset.suggestionIndex) === activeSuggestionIndex;
      li.classList.toggle("is-active", selected);
      li.setAttribute("aria-selected", String(selected));
    });

    if (activeSuggestionIndex >= 0) {
      input!.setAttribute("aria-activedescendant", `searchSuggestion-${activeSuggestionIndex}`);
    } else {
      input!.removeAttribute("aria-activedescendant");
    }
  }

  function fillSuggestion(suggestion: SearchSuggestion): void {
    input!.value = suggestion.value;
    suggestionDraft = suggestion.value;
    previewedSuggestion = suggestion;
    closeSuggestions();
    input!.focus();
  }

  function previewSuggestion(index: number): void {
    activeSuggestionIndex = index;
    const suggestion = visibleSuggestions[activeSuggestionIndex];
    if (!suggestion) return;
    previewedSuggestion = suggestion;
    input!.value = suggestion.value;
    syncActiveSuggestion();
  }

  function submitSearch(suggestion?: SearchSuggestion): void {
    const query = input!.value.trim();
    const target = suggestion?.url ?? getWebsiteUrl(query, getWebsiteAliases(getSources()));
    if (!query && !target) return;

    const destination = target ?? active.url + encodeURIComponent(query);
    history = recordSearchHistory(history, {
      title: suggestion?.title ?? query,
      subtitle: target ? getDomainLabel(destination) ?? destination : `Search ${active.name}`,
      value: suggestion?.value ?? query,
      url: target ?? undefined,
      icon: suggestion?.icon
    });
    window.location.href = destination;
  }

  engineBtn.addEventListener("click", () => {
    menu.hidden ? openMenu() : closeMenu();
  });

  menu.addEventListener("click", (e) => {
    const li = (e.target as Element).closest<HTMLLIElement>("[data-engine]");
    if (!li) return;
    const engine = ENGINES.find((en) => en.id === li.dataset.engine);
    if (engine) applyEngine(engine);
    closeMenu();
    input.focus();
  });

  document.addEventListener("click", (e) => {
    if (!menu.hidden && !engineBtn.contains(e.target as Node) && !menu.contains(e.target as Node)) {
      closeMenu();
    }
    if (!suggestionsMenu.hidden && !form.contains(e.target as Node)) {
      closeSuggestions();
    }
  }, { capture: true });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      closeMenu();
      input.focus();
    }
  });

  input.addEventListener("focus", () => renderSuggestions());
  input.addEventListener("input", () => renderSuggestions());

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && suggestionsMenu.hidden) {
      e.preventDefault();
      renderSuggestions(true);
      if (visibleSuggestions.length > 0) previewSuggestion(0);
      return;
    }

    if (suggestionsMenu.hidden || visibleSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      previewSuggestion((activeSuggestionIndex + 1) % visibleSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      previewSuggestion((activeSuggestionIndex - 1 + visibleSuggestions.length) % visibleSuggestions.length);
    } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      submitSearch(visibleSuggestions[activeSuggestionIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      input.value = suggestionDraft;
      closeSuggestions();
    }
  });

  suggestionsMenu.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });

  suggestionsMenu.addEventListener("click", (e) => {
    const item = (e.target as Element).closest<HTMLLIElement>("[data-suggestion-index]");
    if (!item) return;
    const suggestion = visibleSuggestions[Number(item.dataset.suggestionIndex)];
    if (suggestion) fillSuggestion(suggestion);
  });

  suggestionsMenu.addEventListener("mousemove", (e) => {
    const item = (e.target as Element).closest<HTMLLIElement>("[data-suggestion-index]");
    if (!item) return;
    activeSuggestionIndex = Number(item.dataset.suggestionIndex);
    syncActiveSuggestion();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitSearch(previewedSuggestion);
  });

  input.focus();
}

function renderSuggestion(suggestion: SearchSuggestion, index: number): string {
  const icon = suggestion.icon
    ? `<img src="${escapeHtml(suggestion.icon)}" alt="" class="search-suggestion-icon" draggable="false" />`
    : `<span class="search-suggestion-fallback" aria-hidden="true">${escapeHtml(suggestion.title.slice(0, 1).toUpperCase())}</span>`;
  const typeLabel = suggestion.kind === "history" ? "Recent" : suggestion.kind === "bookmark" ? "Bookmark" : "Website";

  return `
    <li
      class="search-suggestion"
      id="searchSuggestion-${index}"
      role="option"
      data-suggestion-index="${index}"
      aria-selected="${index === 0}"
    >
      ${icon}
      <span class="search-suggestion-copy">
        <span class="search-suggestion-title">${escapeHtml(suggestion.title)}</span>
        <span class="search-suggestion-subtitle">${escapeHtml(suggestion.subtitle)}</span>
      </span>
      <span class="search-suggestion-kind">${typeLabel}</span>
    </li>
  `;
}

function readSearchHistory(): SearchHistoryEntry[] {
  try {
    const value = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value) as SearchHistoryEntry[];
    return Array.isArray(parsed) ? parsed.filter(isHistoryEntry).slice(0, MAX_HISTORY_ITEMS) : [];
  } catch {
    return [];
  }
}

function recordSearchHistory(currentHistory: SearchHistoryEntry[], entry: SearchHistoryEntry): SearchHistoryEntry[] {
  const key = normalizeSearchText(entry.url ?? entry.value);
  const nextHistory = [
    entry,
    ...currentHistory.filter((item) => normalizeSearchText(item.url ?? item.value) !== key)
  ].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
  return nextHistory;
}

function isHistoryEntry(value: SearchHistoryEntry): value is SearchHistoryEntry {
  return Boolean(value && typeof value.title === "string" && typeof value.subtitle === "string" && typeof value.value === "string");
}

function getDomainLabel(value: string): string | null {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    };
    return entities[char] ?? char;
  });
}
