# Setting Up Your Dashboard

## 1. Install & start

```bash
npm install
npm run dev
```

Open **http://localhost:5173** — the dashboard appears immediately with default content.

---

## 2. Personalise tiles and settings

```bash
cp config/tiles.example.ts config/tiles.ts
cp config/settings.example.ts config/settings.ts
```

Edit `config/tiles.ts` to add your bookmarks and `config/settings.ts` to set your name and weather location. Vite picks them up automatically.

---

## 3. Server config (optional)

```bash
cp config/server.example.js config/server.js
```

Edit `config/server.js` to set a Google Weather API key, custom image URL, or a different port. All fields are optional — the dashboard works without it.

---

## 4. Weather

The weather widget works out of the box using [Open-Meteo](https://open-meteo.com/) (no API key needed).

To change your **location and units**, edit `config/settings.ts`:

```ts
export const weatherSettings = {
  label: "Stockholm",
  latitude: 59.33,
  longitude: 18.07,
  units: "metric",   // or "imperial"
};
```

For higher-accuracy weather, add a Google Weather API key to `config/server.js`:

```js
export default {
  googleWeatherApiKey: "your_key_here",
};
```

---

## 5. Calendar

The dashboard reads directly from **Apple Calendar** — no accounts, no API keys, no sign-in flow. It picks up all calendars already synced on your Mac (iCloud, Exchange, local, etc.).

### First-time setup

1. Start the backend server:

   ```bash
   npm run server
   ```

2. Open the dashboard at **http://localhost:4317** — macOS will show a permission prompt asking if the Terminal (or Node) can access your calendars.

3. Click **Allow**.

That's it. If you missed the prompt, go to **System Settings → Privacy & Security → Calendars** and enable access for Terminal (or whichever app runs the server).

---

## 6. Image feed

Set `imageFeedUrl` in `config/server.js` to any direct image URL:

```js
export default {
  imageFeedUrl: "https://your-image-url.jpg",
};
```

The image rotates on a 10-minute cache. Without this set, a random placeholder is shown.

---

## 7. Run as a background service (macOS)

To have the dashboard start automatically on login:

```bash
scripts/install-launch-agent.sh
```

Then open **http://localhost:4317** — no manual start needed.

To uninstall:

```bash
scripts/uninstall-launch-agent.sh
```
