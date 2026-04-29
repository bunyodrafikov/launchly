import { json } from "./http.mjs";

const fallback = {
  url: "https://picsum.photos/800",
  alt: "Curated random image"
};

let cachedImage = null;

export async function handleImageTile(_request, response, config) {
  if (cachedImage?.expiresAt > Date.now()) {
    json(response, 200, cachedImage.payload);
    return;
  }

  const payload = {
    url: config.imageFeedUrl || fallback.url,
    alt: config.imageFeedUrl ? "Curated image" : fallback.alt
  };
  cachedImage = { expiresAt: Date.now() + 10 * 60 * 1000, payload };
  json(response, 200, payload);
}
