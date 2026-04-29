import { cardinalFromDegrees, getQuery, json, weatherIconFromCode } from "./http.mjs";

export async function handleCurrentWeather(request, response, config) {
  const query = getQuery(request, config.appOrigin);
  const point = readPoint(query);
  const payload = config.googleWeatherApiKey
    ? await googleCurrent(point, config.googleWeatherApiKey)
    : await fallbackCurrent(point);
  json(response, 200, payload);
}

export async function handleForecast(request, response, config) {
  const query = getQuery(request, config.appOrigin);
  const point = readPoint(query);
  const days = Number(query.get("days") || 5);
  const payload = config.googleWeatherApiKey
    ? await googleForecast(point, days, config.googleWeatherApiKey)
    : await fallbackForecast(point, days);
  json(response, 200, payload);
}

function readPoint(query) {
  return {
    latitude: Number(query.get("lat")),
    longitude: Number(query.get("lon")),
    label: query.get("label") ?? "",
    units: query.get("units") ?? "metric"
  };
}

async function fallbackCurrent(point) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", point.latitude);
  url.searchParams.set("longitude", point.longitude);
  url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m,wind_direction_10m");
  url.searchParams.set("wind_speed_unit", point.units === "imperial" ? "mph" : "ms");
  const data = await fetchJson(url);
  return {
    temperature: data.current.temperature_2m,
    condition: String(data.current.weather_code),
    icon: weatherIconFromCode(data.current.weather_code),
    windSpeed: data.current.wind_speed_10m,
    windDirection: cardinalFromDegrees(data.current.wind_direction_10m),
    location: point.label
  };
}

async function fallbackForecast(point, days) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", point.latitude);
  url.searchParams.set("longitude", point.longitude);
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant");
  url.searchParams.set("forecast_days", days);
  url.searchParams.set("wind_speed_unit", point.units === "imperial" ? "mph" : "ms");
  const data = await fetchJson(url);
  return data.daily.time.map((date, index) => ({
    date,
    label: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(`${date}T12:00:00Z`)),
    min: data.daily.temperature_2m_min[index],
    max: data.daily.temperature_2m_max[index],
    icon: weatherIconFromCode(data.daily.weather_code[index]),
    windSpeed: data.daily.wind_speed_10m_max[index],
    windDirection: cardinalFromDegrees(data.daily.wind_direction_10m_dominant[index])
  }));
}

async function googleCurrent(point, key) {
  const url = new URL("https://weather.googleapis.com/v1/currentConditions:lookup");
  url.searchParams.set("key", key);
  url.searchParams.set("location.latitude", point.latitude);
  url.searchParams.set("location.longitude", point.longitude);
  const data = await fetchJson(url);
  return {
    temperature: data.temperature?.degrees ?? 0,
    condition: data.weatherCondition?.description?.text ?? "Current",
    icon: googleIcon(data.weatherCondition?.type),
    windSpeed: data.wind?.speed?.value ?? 0,
    windDirection: cardinalFromDegrees(data.wind?.direction?.degrees ?? 0),
    location: point.label
  };
}

async function googleForecast(point, days, key) {
  const url = new URL("https://weather.googleapis.com/v1/forecast/days:lookup");
  url.searchParams.set("key", key);
  url.searchParams.set("location.latitude", point.latitude);
  url.searchParams.set("location.longitude", point.longitude);
  url.searchParams.set("days", String(days));
  const data = await fetchJson(url);
  return (data.forecastDays ?? []).slice(0, days).map((day) => ({
    date: day.interval?.startTime?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    label: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(day.interval?.startTime ?? Date.now())),
    min: day.minTemperature?.degrees ?? 0,
    max: day.maxTemperature?.degrees ?? 0,
    icon: googleIcon(day.daytimeForecast?.weatherCondition?.type),
    windSpeed: day.daytimeForecast?.wind?.speed?.value ?? 0,
    windDirection: cardinalFromDegrees(day.daytimeForecast?.wind?.direction?.degrees ?? 0)
  }));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
  return response.json();
}

function googleIcon(type = "") {
  const normalized = type.toLowerCase();
  if (normalized.includes("clear")) return "sun";
  if (normalized.includes("partly")) return "partly-cloudy";
  if (normalized.includes("rain") || normalized.includes("drizzle")) return "rain";
  if (normalized.includes("snow")) return "snow";
  if (normalized.includes("thunder")) return "storm";
  if (normalized.includes("fog") || normalized.includes("mist")) return "fog";
  return "cloud";
}
