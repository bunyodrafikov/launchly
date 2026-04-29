import { userSettings } from "@config/settings";
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
      />
      <button type="submit" class="search-submit" aria-label="Search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>
    </form>
  `;
}

export function wireSearch(): void {
  const form = document.getElementById("searchForm") as HTMLFormElement | null;
  const input = document.getElementById("searchInput") as HTMLInputElement | null;
  const engineBtn = document.getElementById("searchEngineBtn") as HTMLButtonElement | null;
  const engineIcon = document.getElementById("searchEngineIcon") as HTMLImageElement | null;
  const menu = document.getElementById("searchEngineMenu") as HTMLUListElement | null;

  if (!form || !input || !engineBtn || !engineIcon || !menu) return;

  let active = getActiveEngine();

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
  }, { capture: true });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      closeMenu();
      input.focus();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    window.location.href = active.url + encodeURIComponent(query);
  });

  input.focus();
}
