import type { WeatherIcon } from "../types";

export function weatherIcon(type: WeatherIcon): string {
  const common = `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  const icons: Record<WeatherIcon, string> = {
    sun: `<circle cx="12" cy="12" r="4" ${common}/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" ${common}/>`,
    "partly-cloudy": `<path d="M7.2 14.5a4.2 4.2 0 0 1 6.8-3.3 5.1 5.1 0 0 1 9.1 3.2A3.7 3.7 0 0 1 22 21H8.2a3.3 3.3 0 0 1-1-6.5Z" ${common}/><path d="M5.8 7.4a4.5 4.5 0 0 1 8.1 1.9" ${common}/><path d="M6.5 2.8v1.8M2.8 6.5h1.8M3.9 3.9 5 5" ${common}/>`,
    cloud: `<path d="M6.2 18.5a4 4 0 0 1 .6-7.9 5.9 5.9 0 0 1 11.1 2.1 3.9 3.9 0 0 1-.8 7.8H6.2Z" ${common}/>`,
    rain: `<path d="M6.2 15.2a4 4 0 0 1 .6-7.9 5.9 5.9 0 0 1 11.1 2.1 3.9 3.9 0 0 1-.8 7.8H6.2Z" ${common}/><path d="m8 20 1-1.8M12 21l1-1.8M16 20l1-1.8" ${common}/>`,
    snow: `<path d="M6.2 15.2a4 4 0 0 1 .6-7.9 5.9 5.9 0 0 1 11.1 2.1 3.9 3.9 0 0 1-.8 7.8H6.2Z" ${common}/><path d="M8 20h.01M12 21h.01M16 20h.01" ${common}/>`,
    storm: `<path d="M6.2 15.2a4 4 0 0 1 .6-7.9 5.9 5.9 0 0 1 11.1 2.1 3.9 3.9 0 0 1-.8 7.8H6.2Z" ${common}/><path d="m13 16.5-2 4h3l-1.6 3" ${common}/>`,
    fog: `<path d="M6.2 13.2a4 4 0 0 1 .6-7.9 5.9 5.9 0 0 1 11.1 2.1 3.9 3.9 0 0 1-.8 7.8H6.2Z" ${common}/><path d="M5 18h14M7 21h10" ${common}/>`
  };

  return `<svg class="weather-glyph" viewBox="-2 -2 28 28" aria-hidden="true">${icons[type]}</svg>`;
}

export function smallIcon(name: "pin" | "wind" | "clock" | "refresh" | "chevron-left" | "chevron-right"): string {
  const paths = {
    pin: `<path d="M12 21s7-7.1 7-12A7 7 0 1 0 5 9c0 4.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>`,
    wind: `<path d="M3 8h12a3 3 0 1 0-3-3M3 13h17a3 3 0 1 1-3 3M3 18h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    clock: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v6l4 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    refresh: `<path d="M20 7v5h-5M4 17v-5h5M18 12a6 6 0 0 0-10-4M6 12a6 6 0 0 0 10 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    "chevron-left": `<path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    "chevron-right": `<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
  };
  return `<svg class="inline-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}
