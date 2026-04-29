import { tiles } from "@config/tiles";
import type { LayoutMode, ThemeDefinition, TileDefinition } from "../types";
import { renderThemeDialog, wireThemeDialog } from "./theme";
import { renderWidget, wireWidgets } from "./widgets";

export function renderDashboard(theme: ThemeDefinition): string {
  const mode = getLayoutMode();
  return `
    <main class="dashboard ${mode}" data-layout="${mode}">
      <div class="noise" aria-hidden="true"></div>
      <button class="edit-theme" id="openTheme" type="button" aria-label="Edit theme"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
      <section class="tile-grid" aria-label="Startup links and widgets">
        ${tiles.map((tile) => renderTile(tile, mode)).join("")}
      </section>
      ${renderThemeDialog(theme)}
    </main>
  `;
}

export function wireDashboard(onThemeChange: (theme: ThemeDefinition) => void): void {
  document.querySelector("#openTheme")?.addEventListener("click", () => {
    document.querySelector<HTMLDialogElement>("#themeDialog")?.showModal();
  });
  wireThemeDialog(onThemeChange);
  wireWidgets();
}

export function getLayoutMode(width = window.innerWidth, height = window.innerHeight): LayoutMode {
  return width >= height && width >= 1020 ? "horizontal" : "vertical";
}

function renderTile(tile: TileDefinition, mode: LayoutMode): string {
  const span = tile.layout[mode];
  if (tile.kind !== "bookmark") {
    return `<div class="tile-slot span-${span}">${renderWidget(tile)}</div>`;
  }
  const iconFit = tile.icon?.startsWith("https://cdn.simpleicons.org") ? "contain" : "cover";
  const iconFrameClass = iconFit === "cover" ? "bookmark-icon-frame bookmark-icon-frame--cover" : "bookmark-icon-frame";
  return `
    <a class="tile bookmark-tile span-${span}" href="${tile.href}" aria-label="Open ${tile.title.replace("\n", " ")}">
      <span class="bookmark-title">${tile.title.replace("\n", "<br />")}</span>
      <span class="bookmark-domain">${tile.subtitle ?? ""}</span>
      ${tile.icon ? `<span class="${iconFrameClass}"><img class="bookmark-icon bookmark-icon--${iconFit}" src="${tile.icon}" alt="" /></span>` : ""}
    </a>
  `;
}
