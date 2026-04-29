import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { rootDir } from "./config.mjs";
import { text } from "./http.mjs";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

export function serveStatic(request, response) {
  const distPath = join(rootDir, "dist");
  const publicPath = join(rootDir, "public");
  const url = new URL(request.url || "/", "http://localhost");
  const pathname = decodeURIComponent(url.pathname);
  const candidate = normalize(join(distPath, pathname === "/" ? "index.html" : pathname));
  const publicCandidate = normalize(join(publicPath, pathname.replace(/^\/assets\//, "assets/")));
  const file = pickFile(candidate, distPath) || pickFile(publicCandidate, publicPath) || join(distPath, "index.html");
  if (!existsSync(file)) {
    text(response, 404, "Build the frontend first with npm run build.");
    return;
  }
  response.writeHead(200, {
    "Content-Type": contentTypes[extname(file)] || "application/octet-stream"
  });
  createReadStream(file).pipe(response);
}

function pickFile(path, base) {
  if (!path.startsWith(base) || !existsSync(path)) return null;
  const stat = statSync(path);
  return stat.isFile() ? path : null;
}
