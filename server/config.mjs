import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

let local = {};
try {
  const mod = await import("../config/server.js");
  local = mod.default ?? {};
} catch { /* no local server config — using defaults */ }

const port = local.port ?? 4317;

export const config = {
  host: "127.0.0.1",
  port,
  appOrigin: `http://127.0.0.1:${port}`,
  googleWeatherApiKey: local.googleWeatherApiKey ?? "",
  imageFeedUrl: local.imageFeedUrl ?? "",
};
