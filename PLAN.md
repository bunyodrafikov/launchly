# Plan: Search bar with autofocus and engine picker

## Context

When Launchly is set as Safari's homepage, Safari does not auto-focus the address bar the way it does for the native start page. The user has to click before they can type. Adding an autofocused search input restores the "open new tab → start typing" flow.

Layout of the search row, left to right:

```
[ engine-icon ▾ ]  [ input (autofocus) ]  [ 🔍 submit ]
```

The engine icon on the left is a dropdown to switch between **Google**, **DuckDuckGo**, **Perplexity**, **ChatGPT**. Selection persists across reloads (localStorage), with the initial default coming from `config/settings.ts`.

## Branch & commit strategy

Work happens on a dedicated feature branch, not on `master`. Logical commits along the way so the history reads well.

```bash
git checkout -b feat/search-bar
```

Commits (one per logical step):

1. `feat(search): add SearchEngineId type and default engine setting`
   — `src/types.ts`, `config/settings.example.ts`, `config/settings.ts`
2. `feat(search): add search component with engine picker`
   — new `src/components/search.ts` (render + wire, ENGINES table, localStorage persistence)
3. `feat(search): mount search row in dashboard`
   — `src/components/dashboard.ts`
4. `style(search): glassy search row and dropdown menu`
   — `src/styles.css`
5. `docs: note search engine setting in README`
   — `README.md` (add `defaultSearchEngine` row to settings docs if a settings table exists, otherwise a short paragraph under "Customise Your Tiles")

After verification: open a PR from `feat/search-bar` → `master` (no auto-push; ask before `git push`).

## Engine table

| id           | name        | url template                                         | icon                                              |
|--------------|-------------|------------------------------------------------------|---------------------------------------------------|
| `google`     | Google      | `https://www.google.com/search?q=`                   | `https://cdn.simpleicons.org/google`              |
| `duckduckgo` | DuckDuckGo  | `https://duckduckgo.com/?q=`                         | `https://cdn.simpleicons.org/duckduckgo`          |
| `perplexity` | Perplexity  | `https://www.perplexity.ai/search?q=`                | `https://cdn.simpleicons.org/perplexity`          |
| `chatgpt`    | ChatGPT     | `https://chatgpt.com/?q=`                            | local `/assets/icons/chatgpt-example.webp` (CDN slug 404s; file already in `config/icons/`) |

Centralized in a single `ENGINES` const in `src/components/search.ts`.

## Files to modify

### 1. `src/types.ts`
```ts
export type SearchEngineId = "google" | "duckduckgo" | "perplexity" | "chatgpt";
```

### 2. `config/settings.example.ts` and `config/settings.ts`
```ts
export const userSettings = {
  name: "Friend",
  defaultSearchEngine: "google" as SearchEngineId
};
```

### 3. New file `src/components/search.ts`
Mirrors `theme.ts` / `widgets.ts`. Exports:

- `ENGINES` — the table above.
- `renderSearch(): string` — markup:
  ```html
  <form class="search" id="searchForm">
    <button type="button" class="search-engine" id="searchEngineBtn" aria-haspopup="listbox" aria-expanded="false">
      <img class="search-engine-icon" src="..." alt="" />
      <svg class="search-engine-caret">…</svg>
    </button>
    <ul class="search-engine-menu" id="searchEngineMenu" role="listbox" hidden>
      <li role="option" data-engine="google">…</li>
      …
    </ul>
    <input class="search-input" id="searchInput" type="search" autofocus
           autocomplete="off" placeholder="Search Google" aria-label="Search" />
    <button type="submit" class="search-submit" aria-label="Search">
      <svg>… magnifier …</svg>
    </button>
  </form>
  ```
- `wireSearch(): void`:
  - reads current engine from `localStorage.getItem("launchly.searchEngine")`, falls back to `userSettings.defaultSearchEngine`.
  - sets engine icon + input `placeholder` ("Search {Name}").
  - dropdown toggle: click engine button → toggles `hidden`, updates `aria-expanded`.
  - menu item click → updates engine, persists to localStorage, closes menu, re-focuses input.
  - outside-click and Escape close the menu.
  - form submit → trims query, no-op if empty, else `window.location.href = template + encodeURIComponent(query)`.
  - explicit `inputEl.focus()` at end of wiring (covers re-render path on theme change / resize).

### 4. `src/components/dashboard.ts`
- `renderDashboard`: insert `${renderSearch()}` above `<section class="tile-grid">`.
- `wireDashboard`: call `wireSearch()`.

### 5. `src/styles.css`
`.search` block above the tile grid. Glassy pill matching `.bookmark-icon-frame` treatment (`backdrop-filter: blur(...)`, layered light gradient, subtle inner highlight, soft shadow). Single rounded-pill container with three regions: engine button (left), input (flex), submit (right). Dropdown menu is a small floating panel below the engine button, same glass treatment. Width capped (~520px), centered. Placeholder muted via existing `--text-muted` token.

### 6. `README.md`
Mention `defaultSearchEngine` in the "Customise Your Tiles" or settings section so users know they can change it.

## Behavior details

- Persistence key: `launchly.searchEngine` (theme key `startup-dashboard.themeVars` is left untouched to avoid breaking saved themes).
- `autofocus` attribute + explicit `.focus()` in `wireSearch()` so theme change re-renders still focus the input.
- Empty submit returns early.
- ChatGPT icon: local file at `config/icons/chatgpt-example.webp`, referenced as `/assets/icons/chatgpt-example.webp` (matches how tiles consume local icons per README).

## Verification

1. `npm run dev` → open `http://localhost:5173`.
2. Page loads → cursor is in the search input without clicking. Placeholder reads "Search Google".
3. Type "claude code" → Enter → navigates to Google results.
4. Click the engine icon → dropdown shows Google / DuckDuckGo / Perplexity / ChatGPT. Click DuckDuckGo → icon updates, placeholder becomes "Search DuckDuckGo", input re-focused.
5. Reload → DuckDuckGo persists.
6. Click outside the menu / press Escape → menu closes.
7. Submit empty → nothing happens.
8. Open theme dialog, change theme → input re-focused and engine selection persists.
9. Resize across horizontal/vertical breakpoint → search row survives re-render.
10. `npm run lint` passes.
11. `git log --oneline feat/search-bar ^master` shows the 5 commits above in order.

## Out of scope

- Suggestions / autocomplete.
- Keyboard navigation inside the dropdown (arrow keys) — click + Escape only.
- Custom user-defined engines.
