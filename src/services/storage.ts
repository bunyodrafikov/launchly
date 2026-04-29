import { weatherSettings } from "@config/settings";
import { builtInThemes, defaultTheme } from "../data/themes";
import type { ThemeDefinition, WeatherSettings } from "../types";

const customThemesKey = "startup-dashboard.customThemes";
const activeThemeKey = "startup-dashboard.activeTheme";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getCustomThemes(): ThemeDefinition[] {
  return readJson<ThemeDefinition[]>(customThemesKey, []);
}

export function saveCustomThemes(themes: ThemeDefinition[]): void {
  localStorage.setItem(customThemesKey, JSON.stringify(themes));
}

export function getAllThemes(): ThemeDefinition[] {
  return [...builtInThemes, ...getCustomThemes()];
}

export function getActiveTheme(): ThemeDefinition {
  const id = localStorage.getItem(activeThemeKey) ?? defaultTheme.id;
  return getAllThemes().find((theme) => theme.id === id) ?? defaultTheme;
}

export function setActiveTheme(id: string): void {
  localStorage.setItem(activeThemeKey, id);
}

export function getWeatherSettings(): WeatherSettings {
  return weatherSettings;
}
