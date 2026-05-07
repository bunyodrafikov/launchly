import type { SearchEngineId, WeatherSettings } from "../src/types";

export const userSettings = {
  name: "Friend",
  defaultSearchEngine: "google" as SearchEngineId
};

export const weatherSettings: WeatherSettings = {
  label: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  units: "metric"
};
