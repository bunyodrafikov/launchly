import { fetchCalendarEvents, fetchCalendarStatus, fetchCurrentWeather, fetchForecast, fetchImageTile } from "../services/api";
import { getWeatherSettings } from "../services/storage";
import type { CalendarEvent, CurrentWeather, ForecastDay, TileDefinition } from "../types";
import { smallIcon, weatherIcon } from "./icons";

// ── State ────────────────────────────────────────────────────────────────────

let calendarEvents: CalendarEvent[] = [];
let selectedEventDate = dateKey(new Date());
let viewedMonth = new Date();

// ── Public API ───────────────────────────────────────────────────────────────

export function renderWidget(tile: TileDefinition): string {
  if (tile.kind === "forecast") return renderWeatherLoading();
  if (tile.kind === "calendar") return renderMiniCalendar(new Date());
  if (tile.kind === "image") return renderImageTile();
  return "";
}

export function wireWidgets(): void {
  void hydrateWeather();
  void hydrateEvents();
  void hydrateImage();
  wireCalendarNav();
}

// ── Weather ──────────────────────────────────────────────────────────────────

async function hydrateWeather(): Promise<void> {
  const settings = getWeatherSettings();
  try {
    const [current, forecast] = await Promise.all([fetchCurrentWeather(settings), fetchForecast(settings)]);
    replace("#forecastTile", renderWeather(current, forecast, settings.label));
  } catch {
    replace("#forecastTile", `<div class="tile forecast-tile forecast-tile--error"><p>Weather unavailable</p></div>`);
  }
}

function renderWeatherLoading(): string {
  return `<div class="tile forecast-tile forecast-tile--loading" id="forecastTile" aria-busy="true"></div>`;
}

function renderWeather(current: CurrentWeather, days: ForecastDay[], location: string): string {
  const weatherUrl = `https://www.google.com/search?q=${encodeURIComponent(`weather ${location}`)}`;
  return `
    <a class="tile forecast-tile" id="forecastTile" href="${weatherUrl}" aria-label="Open Google Weather for ${location}">
      <div class="weather-now">
        <div class="weather-chip current-chip">${weatherIcon(current.icon)}</div>
        <div class="weather-now-copy">
          <div class="current-temp">${Math.round(current.temperature)} °C</div>
          <div class="forecast-meta">${smallIcon("wind")} ${current.windDirection} ${Math.round(current.windSpeed)} m/s</div>
          <div class="weather-location">${location}</div>
        </div>
      </div>
      <div class="forecast-list">
        ${days.slice(0, 7).map((day) => `
          <div class="forecast-day">
            <div class="weather-chip">${weatherIcon(day.icon)}</div>
            <div class="forecast-main">
              <strong>${day.label}</strong>
              <span>${smallIcon("wind")} ${day.windDirection} ${Math.round(day.windSpeed)} m/s</span>
            </div>
            <div class="forecast-temp"><span>${Math.round(day.min)}°</span><strong>${Math.round(day.max)}°</strong></div>
          </div>
        `).join("")}
      </div>
    </a>
  `;
}

// ── Calendar ─────────────────────────────────────────────────────────────────

function renderMiniCalendar(today: Date): string {
  const month = viewedMonth.toLocaleString("en-US", { month: "long" });
  return `
    <section class="tile calendar-tile">
      <div class="calendar-pane">
        <div class="calendar-nav">
          <button id="calNavPrev" class="cal-nav-btn" type="button" aria-label="Previous month">${smallIcon("chevron-left")}</button>
          <span id="calNavLabel"><strong>${month}</strong></span>
          <button id="calNavNext" class="cal-nav-btn" type="button" aria-label="Next month">${smallIcon("chevron-right")}</button>
        </div>
        <div class="calendar-weekdays"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div>
        <div class="calendar-grid" id="calGrid">${renderCalendarCells(viewedMonth, today)}</div>
      </div>
      <div class="calendar-events" id="eventsTile">
        ${renderEventsMessage("Loading events...")}
      </div>
    </section>
  `;
}

function renderCalendarCells(month: Date, today: Date): string {
  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cellCount = Math.ceil((offset + daysInMonth) / 7) * 7;
  return Array.from({ length: cellCount }, (_, i) => {
    const date = new Date(year, m, i - offset + 1);
    const key = dateKey(date);
    const classes = [
      key === dateKey(today) ? "today" : "",
      key === selectedEventDate ? "selected" : "",
      date.getMonth() !== m ? "muted" : "",
    ].filter(Boolean).join(" ");
    return `<button class="${classes}" data-date="${key}" type="button">${date.getDate()}</button>`;
  }).join("");
}

function wireCalendarNav(): void {
  const today = new Date();
  document.querySelector("#calNavPrev")?.addEventListener("click", () => {
    viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() - 1, 1);
    updateCalendarGrid(today);
  });
  document.querySelector("#calNavNext")?.addEventListener("click", () => {
    viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 1);
    updateCalendarGrid(today);
  });
}

function updateCalendarGrid(today: Date): void {
  const label = document.querySelector("#calNavLabel");
  const grid = document.querySelector("#calGrid");
  if (!label || !grid) return;
  label.innerHTML = `<strong>${viewedMonth.toLocaleString("en-US", { month: "long" })}</strong>`;
  grid.innerHTML = renderCalendarCells(viewedMonth, today);
  addEventIndicators();
  wireCalendarDateButtons();
}

function wireCalendarDateButtons(): void {
  document.querySelectorAll<HTMLButtonElement>(".calendar-grid button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedEventDate = button.dataset.date ?? selectedEventDate;
      document.querySelectorAll<HTMLButtonElement>(".calendar-grid button").forEach((item) => {
        item.classList.toggle("selected", item.dataset.date === selectedEventDate);
      });
      renderEventsForSelectedDate();
    });
  });
}

function addEventIndicators(): void {
  const eventDates = new Set(calendarEvents.map((e) => dateKey(new Date(e.startsAt))));
  document.querySelectorAll<HTMLButtonElement>("#calGrid button[data-date]").forEach((btn) => {
    btn.classList.toggle("has-event", eventDates.has(btn.dataset.date ?? ""));
  });
}

// ── Calendar events ───────────────────────────────────────────────────────────

async function hydrateEvents(): Promise<void> {
  const tile = document.querySelector("#eventsTile");
  if (!tile) return;
  try {
    const status = await fetchCalendarStatus();
    if (!status.signedIn) {
      tile.innerHTML = `<div class="widget-title-row"><h3>Events</h3></div><p class="empty-message">Allow Calendar access in<br><strong>System Settings → Privacy &amp; Security → Calendars</strong></p>`;
      return;
    }
    calendarEvents = await fetchCalendarEvents();
    renderEventsForSelectedDate();
    addEventIndicators();
    wireCalendarDateButtons();
  } catch {
    tile.innerHTML = renderEventsMessage("Calendar is unavailable.");
  }
}

function renderEventsForSelectedDate(): void {
  const tile = document.querySelector("#eventsTile");
  if (!tile) return;
  const filtered = calendarEvents.filter((e) => dateKey(new Date(e.startsAt)) === selectedEventDate);
  tile.innerHTML = filtered.length === 0 ? renderEventsEmpty() : renderEvents(filtered);
  wireEventClicks();
}

function wireEventClicks(): void {
  document.querySelectorAll<HTMLElement>(".event-item").forEach((item) => {
    item.addEventListener("click", () => {
      const url = item.dataset.url;
      if (url) window.open(url, "_blank", "noopener noreferrer");
      else fetch("/api/calendar/open").catch(() => {});
    });
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); item.click(); }
    });
  });
}

type EventState = "past" | "active" | "upcoming";

function getEventState(event: CalendarEvent): EventState {
  if (selectedEventDate !== dateKey(new Date())) return "upcoming";
  const now = Date.now();
  const start = new Date(event.startsAt).getTime();
  const end = event.endsAt ? new Date(event.endsAt).getTime() : start + 60 * 60 * 1000;
  if (end < now) return "past";
  if (start <= now) return "active";
  return "upcoming";
}

function formatTimeRange(event: CalendarEvent): string {
  if (event.allDay) return "All day";
  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const start = new Date(event.startsAt);
  if (!event.endsAt) return fmt(start);
  return `${fmt(start)} – ${fmt(new Date(event.endsAt))}`;
}

function eventsDateLabel(): string {
  const d = new Date(`${selectedEventDate}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function renderEvents(events: CalendarEvent[]): string {
  const label = eventsDateLabel();
  const items = events.map((ev) => {
    const state = getEventState(ev);
    const time = formatTimeRange(ev);
    const clickable = Boolean(ev.url) || state !== "past";
    return `
      <article class="event-item event-item--${state}${clickable ? " event-item--clickable" : ""}"
               data-url="${ev.url ?? ""}" role="button" tabindex="0" aria-label="${ev.title}">
        <div class="event-item-row">
          <strong class="event-title">${ev.title}</strong>
          ${state === "active" ? `<span class="event-badge">Now</span>` : ""}
        </div>
        <span class="event-time">${time}</span>
      </article>
    `;
  }).join("");
  return `
    <div class="widget-title-row"><div><h3>Events</h3><p class="panel-subtitle">${label}</p></div></div>
    <div class="event-list">${items}</div>
  `;
}

function renderEventsEmpty(): string {
  const label = eventsDateLabel();
  return `
    <div class="widget-title-row"><div><h3>Events</h3><p class="panel-subtitle">${label}</p></div></div>
    <div class="events-empty">
      <svg class="events-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
        <path d="M16 3v4M8 3v4M2 11h20"/>
        <path d="m9 16 2 2 4-4"/>
      </svg>
      <p class="events-empty-heading">All clear</p>
    </div>
  `;
}

function renderEventsMessage(message: string, label?: string): string {
  return `<div class="widget-title-row"><div><h3>Events</h3>${label ? `<p class="panel-subtitle">${label}</p>` : ""}</div></div><p class="empty-message">${message}</p>`;
}

// ── Image ─────────────────────────────────────────────────────────────────────

async function hydrateImage(): Promise<void> {
  const image = document.querySelector<HTMLImageElement>("#rotatingImage");
  if (!image) return;
  try {
    const result = await fetchImageTile();
    image.src = result.url;
    image.alt = result.alt;
  } catch {
    image.src = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85";
    image.alt = "Landscape";
  }
}

function renderImageTile(): string {
  return `
    <section class="image-tile">
      <img id="rotatingImage" alt="Curated dashboard image" />
    </section>
  `;
}

// ── Utilities ────────────────────────────────────────────────────────────────

function replace(selector: string, html: string): void {
  const node = document.querySelector(selector);
  if (node) node.outerHTML = html;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
