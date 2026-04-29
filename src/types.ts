export type LayoutMode = "horizontal" | "vertical";

export type TileKind =
  | "bookmark"
  | "forecast"
  | "current-weather"
  | "calendar"
  | "events"
  | "image";

export interface TileDefinition {
  id: string;
  kind: TileKind;
  title: string;
  subtitle?: string;
  href?: string;
  icon?: string;
  layout: Record<LayoutMode, string>;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  tone?: "light" | "dark";
  colors: {
    backdropTop: string;
    backdropBottom: string;
    tile: string;
    tileMuted: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
    glow: string;
  };
  radius: number;
  tileOpacity: number;
  fontFamily: string;
  displayFamily?: string;
}

export interface WeatherSettings {
  label: string;
  latitude: number;
  longitude: number;
  units: "metric" | "imperial";
}

export interface CurrentWeather {
  temperature: number;
  condition: string;
  icon: WeatherIcon;
  windSpeed: number;
  windDirection: string;
  location: string;
}

export interface ForecastDay {
  date: string;
  label: string;
  min: number;
  max: number;
  icon: WeatherIcon;
  windSpeed: number;
  windDirection: string;
}

export type WeatherIcon = "sun" | "partly-cloudy" | "cloud" | "rain" | "snow" | "storm" | "fog";

export interface CalendarEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  allDay?: boolean;
  url?: string;
  calendar?: string;
}

export interface ThemeDraft {
  name: string;
  backdropTop: string;
  backdropBottom: string;
  tile: string;
  accent: string;
  text: string;
  textMuted: string;
  radius: number;
  tileOpacity: number;
}
