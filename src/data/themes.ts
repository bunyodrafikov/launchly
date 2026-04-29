import type { ThemeDefinition } from "../types";

export const defaultTheme: ThemeDefinition = {
  id: "liquid-dawn",
  name: "Liquid Dawn",
  tone: "light",
  colors: {
    backdropTop: "#f4f7fb",
    backdropBottom: "#7f9cad",
    tile: "#ffffff",
    tileMuted: "#59707c",
    text: "#14212a",
    textMuted: "#526872",
    border: "rgba(255, 255, 255, 0.72)",
    accent: "#2f8fb0",
    glow: "rgba(255, 255, 255, 0.82)"
  },
  radius: 22,
  tileOpacity: 0.26,
  fontFamily: "\"SF Pro Text\", \"Aptos\", \"Inter\", system-ui, sans-serif",
  displayFamily: "\"Avenir Next\", \"SF Pro Display\", \"Inter Tight\", \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif"
};

export const builtInThemes: ThemeDefinition[] = [
  defaultTheme,
  {
    id: "glass-orbit",
    name: "Glass Orbit",
    tone: "light",
    colors: {
      backdropTop: "#edf2f7",
      backdropBottom: "#778ea2",
      tile: "#f7fbff",
      tileMuted: "#627482",
      text: "#151f28",
      textMuted: "#5e6e79",
      border: "rgba(255, 255, 255, 0.58)",
      accent: "#667eea",
      glow: "rgba(235, 246, 255, 0.72)"
    },
    radius: 22,
    tileOpacity: 0.24,
    fontFamily: "\"SF Pro Text\", \"Aptos\", \"Inter\", system-ui, sans-serif",
    displayFamily: "\"Avenir Next\", \"SF Pro Display\", \"Inter Tight\", \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif"
  },
  {
    id: "midnight-ide",
    name: "Midnight IDE",
    tone: "dark",
    colors: {
      backdropTop: "#05070b",
      backdropBottom: "#0d1521",
      tile: "#0b111a",
      tileMuted: "#7c90a5",
      text: "#eff6ff",
      textMuted: "#8fa4b8",
      border: "rgba(158, 187, 214, 0.12)",
      accent: "#5ac8fa",
      glow: "rgba(31, 56, 83, 0.38)"
    },
    radius: 22,
    tileOpacity: 0.88,
    fontFamily: "\"SF Pro Text\", \"Aptos\", \"Inter\", system-ui, sans-serif",
    displayFamily: "\"Avenir Next\", \"SF Pro Display\", \"Inter Tight\", \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif"
  },
  {
    id: "amber-monochrome",
    name: "Amber Monochrome",
    tone: "dark",
    colors: {
      backdropTop: "#090705",
      backdropBottom: "#17110d",
      tile: "#120d09",
      tileMuted: "#b39c84",
      text: "#fff4ea",
      textMuted: "#c7b19a",
      border: "rgba(214, 178, 145, 0.11)",
      accent: "#ffb454",
      glow: "rgba(110, 61, 18, 0.34)"
    },
    radius: 22,
    tileOpacity: 0.9,
    fontFamily: "\"SF Pro Text\", \"Aptos\", \"Inter\", system-ui, sans-serif",
    displayFamily: "\"Avenir Next\", \"SF Pro Display\", \"Inter Tight\", \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif"
  }
];
