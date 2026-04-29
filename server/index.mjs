import { createServer } from "node:http";
import { config } from "./config.mjs";
import { handleCalendarEvents, handleCalendarOpen, handleCalendarStatus } from "./apple-calendar.mjs";
import { json } from "./http.mjs";
import { handleImageTile } from "./image-tile.mjs";
import { serveStatic } from "./static.mjs";
import { handleCurrentWeather, handleForecast } from "./weather.mjs";

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", config.appOrigin);
    if (url.pathname === "/api/health") return json(response, 200, { ok: true });
    if (url.pathname === "/api/weather/current") return await handleCurrentWeather(request, response, config);
    if (url.pathname === "/api/weather/forecast") return await handleForecast(request, response, config);
    if (url.pathname === "/api/calendar/status") return await handleCalendarStatus(request, response);
    if (url.pathname === "/api/calendar/events") return await handleCalendarEvents(request, response);
    if (url.pathname === "/api/calendar/open") return await handleCalendarOpen(request, response);
    if (url.pathname === "/api/image-tile") return await handleImageTile(request, response, config);
    return serveStatic(request, response);
  } catch (error) {
    json(response, 500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Startup dashboard running at http://${config.host}:${config.port}`);
});
