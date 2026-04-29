import { exec, spawn } from "node:child_process";
import { json } from "./http.mjs";

function runJXA(script) {
  return new Promise((resolve, reject) => {
    const proc = spawn("osascript", ["-l", "JavaScript"]);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("close", (code) => {
      if (code !== 0) reject(new Error(stderr.trim()));
      else resolve(stdout.trim());
    });
    proc.stdin.write(script);
    proc.stdin.end();
  });
}

const STATUS_SCRIPT = `
  try {
    const app = Application("Calendar");
    app.calendars.name();
    "ok";
  } catch (e) {
    "denied";
  }
`;

function eventsScript(days) {
  return `
    const app = Application("Calendar");
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoff = new Date(startOfToday.getTime() + ${days} * 86400000);
    const results = [];
    for (const cal of app.calendars()) {
      try {
        const calName = cal.name();
        const evs = cal.events();
        for (const ev of evs) {
          try {
            const start = ev.startDate();
            if (start < startOfToday || start > cutoff) continue;
            const allDay = (() => { try { return ev.alldayEvent(); } catch(_) { return false; } })();
            const endsAt = (() => { try { return ev.endDate().toISOString(); } catch(_) { return ""; } })();
            const url = (() => { try { return ev.url() || ""; } catch(_) { return ""; } })();
            const uid = (() => { try { return ev.uid(); } catch(_) { return ""; } })();
            results.push({
              id: uid,
              title: ev.summary(),
              startsAt: start.toISOString(),
              endsAt,
              allDay,
              url,
              calendar: calName
            });
          } catch (_) {}
        }
      } catch (_) {}
    }
    results.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    JSON.stringify(results);
  `;
}

let eventsCache = null;
let activeFetch = null;

function startFetch(days = 30) {
  if (activeFetch) return activeFetch;
  activeFetch = runJXA(eventsScript(days))
    .then((raw) => {
      const payload = JSON.parse(raw);
      eventsCache = { payload, expiresAt: Date.now() + 5 * 60 * 1000 };
      return payload;
    })
    .catch(() => eventsCache?.payload ?? [])
    .finally(() => { activeFetch = null; });
  return activeFetch;
}

// Pre-warm on server start so first page load is instant
startFetch();
setInterval(() => startFetch(), 5 * 60 * 1000);

export async function handleCalendarStatus(_request, response) {
  try {
    const result = await runJXA(STATUS_SCRIPT);
    json(response, 200, { configured: true, signedIn: result === "ok" });
  } catch {
    json(response, 200, { configured: true, signedIn: false });
  }
}

export async function handleCalendarEvents(request, response) {
  if (eventsCache?.expiresAt > Date.now()) {
    json(response, 200, eventsCache.payload);
    return;
  }
  const url = new URL(request.url, "http://localhost");
  const days = Number(url.searchParams.get("days") || 30);
  const payload = await (activeFetch ?? startFetch(days));
  json(response, 200, Array.isArray(payload) ? payload : []);
}

export async function handleCalendarOpen(_request, response) {
  exec("open -a Calendar");
  json(response, 200, { ok: true });
}
