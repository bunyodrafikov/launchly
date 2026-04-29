import type { CalendarEvent, CurrentWeather, ForecastDay, WeatherSettings } from "../types";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchCurrentWeather(settings: WeatherSettings): Promise<CurrentWeather> {
  const params = new URLSearchParams({
    lat: String(settings.latitude),
    lon: String(settings.longitude),
    units: settings.units,
    label: settings.label
  });
  return request<CurrentWeather>(`/api/weather/current?${params.toString()}`);
}

export function fetchForecast(settings: WeatherSettings): Promise<ForecastDay[]> {
  const params = new URLSearchParams({
    lat: String(settings.latitude),
    lon: String(settings.longitude),
    units: settings.units,
    label: settings.label,
    days: "7"
  });
  return request<ForecastDay[]>(`/api/weather/forecast?${params.toString()}`);
}

export function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  return request<CalendarEvent[]>("/api/calendar/events?days=30");
}

export function fetchCalendarStatus(): Promise<{ configured: boolean; signedIn: boolean; authUrl?: string }> {
  return request<{ configured: boolean; signedIn: boolean; authUrl?: string }>("/api/calendar/status");
}

export function fetchImageTile(): Promise<{ url: string; alt: string }> {
  return request<{ url: string; alt: string }>("/api/image-tile");
}
