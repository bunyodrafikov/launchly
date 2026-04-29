import { defaultTheme } from "../data/themes";
import { getAllThemes, getCustomThemes, saveCustomThemes, setActiveTheme } from "../services/storage";
import type { ThemeDefinition, ThemeDraft } from "../types";

export function applyTheme(theme: ThemeDefinition): void {
  const root = document.documentElement;
  const displayFamily = theme.displayFamily ?? defaultTheme.displayFamily ?? '"Avenir Next", "SF Pro Display", "Inter Tight", sans-serif';
  const vars: Record<string, string> = {
    "--backdrop-top": theme.colors.backdropTop,
    "--backdrop-bottom": theme.colors.backdropBottom,
    "--tile": theme.colors.tile,
    "--tile-muted": theme.colors.tileMuted,
    "--text": theme.colors.text,
    "--text-muted": theme.colors.textMuted,
    "--border": theme.colors.border,
    "--accent": theme.colors.accent,
    "--glow": theme.colors.glow,
    "--radius": `${theme.radius}px`,
    "--tile-opacity": String(theme.tileOpacity),
    "--font-family": theme.fontFamily,
    "--display-family": displayFamily,
  };
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  root.dataset.themeTone = theme.tone ?? "light";
  try {
    localStorage.setItem("startup-dashboard.themeVars", JSON.stringify({ ...vars, "data-theme-tone": theme.tone ?? "light" }));
  } catch { /* storage unavailable */ }
}

export function renderThemeDialog(active: ThemeDefinition): string {
  const themes = getAllThemes();
  return `
    <dialog class="theme-dialog" id="themeDialog">
      <form class="theme-panel" method="dialog">
        <header>
          <div>
            <p class="eyebrow">Themes</p>
            <h2>Atmosphere</h2>
          </div>
          <button class="icon-button" value="close" aria-label="Close">x</button>
        </header>
        <label>
          <span>Current theme</span>
          <select id="themeSelect">
            ${themes.map((theme) => `<option value="${theme.id}" ${theme.id === active.id ? "selected" : ""}>${theme.name}</option>`).join("")}
          </select>
        </label>
        <div class="theme-grid">
          <label><span>Name</span><input id="themeName" value="${active.name}" /></label>
          <label><span>Top</span><input id="themeTop" type="color" value="${active.colors.backdropTop}" /></label>
          <label><span>Bottom</span><input id="themeBottom" type="color" value="${active.colors.backdropBottom}" /></label>
          <label><span>Tile</span><input id="themeTile" type="color" value="${active.colors.tile}" /></label>
          <label><span>Accent</span><input id="themeAccent" type="color" value="${active.colors.accent}" /></label>
          <label><span>Text</span><input id="themeText" type="color" value="${active.colors.text}" /></label>
          <label><span>Muted</span><input id="themeMuted" type="color" value="${active.colors.textMuted}" /></label>
          <label><span>Radius</span><input id="themeRadius" type="range" min="4" max="18" value="${active.radius}" /></label>
          <label><span>Opacity</span><input id="themeOpacity" type="range" min="0.75" max="1" step="0.01" value="${active.tileOpacity}" /></label>
        </div>
        <footer>
          <button type="button" id="exportTheme">Export</button>
          <label class="import-button">Import<input id="importTheme" type="file" accept="application/json" /></label>
          <button type="button" id="saveTheme" class="primary">Save as Custom</button>
        </footer>
      </form>
    </dialog>
  `;
}

export function wireThemeDialog(onThemeChange: (theme: ThemeDefinition) => void): void {
  const select = document.querySelector<HTMLSelectElement>("#themeSelect");
  const save = document.querySelector<HTMLButtonElement>("#saveTheme");
  const exportButton = document.querySelector<HTMLButtonElement>("#exportTheme");
  const importInput = document.querySelector<HTMLInputElement>("#importTheme");

  select?.addEventListener("change", () => {
    const theme = getAllThemes().find((item) => item.id === select.value) ?? defaultTheme;
    setActiveTheme(theme.id);
    applyTheme(theme);
    onThemeChange(theme);
  });

  save?.addEventListener("click", () => {
    const draft = readDraft();
    const theme = draftToTheme(draft);
    saveCustomThemes([...getCustomThemes().filter((item) => item.id !== theme.id), theme]);
    setActiveTheme(theme.id);
    applyTheme(theme);
    onThemeChange(theme);
  });

  exportButton?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(readDraft(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "startup-dashboard-theme.json";
    anchor.click();
    URL.revokeObjectURL(url);
  });

  importInput?.addEventListener("change", async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    const draft = JSON.parse(await file.text()) as ThemeDraft;
    const theme = draftToTheme(draft);
    saveCustomThemes([...getCustomThemes().filter((item) => item.id !== theme.id), theme]);
    setActiveTheme(theme.id);
    applyTheme(theme);
    onThemeChange(theme);
  });
}

function readDraft(): ThemeDraft {
  return {
    name: getInput("themeName", "Custom Mist"),
    backdropTop: getInput("themeTop", defaultTheme.colors.backdropTop),
    backdropBottom: getInput("themeBottom", defaultTheme.colors.backdropBottom),
    tile: getInput("themeTile", defaultTheme.colors.tile),
    accent: getInput("themeAccent", defaultTheme.colors.accent),
    text: getInput("themeText", defaultTheme.colors.text),
    textMuted: getInput("themeMuted", defaultTheme.colors.textMuted),
    radius: Number(getInput("themeRadius", String(defaultTheme.radius))),
    tileOpacity: Number(getInput("themeOpacity", String(defaultTheme.tileOpacity)))
  };
}

function draftToTheme(draft: ThemeDraft): ThemeDefinition {
  const id = `custom-${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "theme"}`;
  return {
    id,
    name: draft.name,
    tone: inferTone(draft.backdropTop, draft.text),
    colors: {
      backdropTop: draft.backdropTop,
      backdropBottom: draft.backdropBottom,
      tile: draft.tile,
      tileMuted: draft.textMuted,
      text: draft.text,
      textMuted: draft.textMuted,
      border: "rgba(255, 255, 255, 0.16)",
      accent: draft.accent,
      glow: "rgba(255, 255, 255, 0.24)"
    },
    radius: draft.radius,
    tileOpacity: draft.tileOpacity,
    fontFamily: defaultTheme.fontFamily,
    displayFamily: defaultTheme.displayFamily
  };
}

function inferTone(backdrop: string, text: string): "light" | "dark" {
  const backdropLuma = relativeLuminance(backdrop);
  const textLuma = relativeLuminance(text);
  return backdropLuma < textLuma ? "dark" : "light";
}

function relativeLuminance(color: string): number {
  const hex = color.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return 1;
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const channel = (value: number) => value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function getInput(id: string, fallback: string): string {
  return document.querySelector<HTMLInputElement>(`#${id}`)?.value || fallback;
}
