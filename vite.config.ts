import { createReadStream, existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const configIconsDir = resolve("config/icons");

const MIME: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function localConfigPlugin(): Plugin {
  return {
    name: "local-config",
    resolveId(source) {
      if (!source.startsWith("@config/")) return null;
      const name = source.slice("@config/".length);
      const personal = resolve(`config/${name}.ts`);
      const example = resolve(`config/${name}.example.ts`);
      return existsSync(personal) ? personal : existsSync(example) ? example : null;
    },
  };
}

function configIconsPlugin(): Plugin {
  return {
    name: "config-icons",
    configureServer(server) {
      server.middlewares.use("/assets/icons", (req, res, next) => {
        const file = resolve(configIconsDir, (req.url ?? "/").replace(/^\//, ""));
        if (!existsSync(file) || !existsSync(configIconsDir)) return next();
        res.setHeader("Content-Type", MIME[extname(file)] ?? "application/octet-stream");
        createReadStream(file).pipe(res);
      });
    },
    generateBundle() {
      if (!existsSync(configIconsDir)) return;
      for (const name of readdirSync(configIconsDir)) {
        const file = resolve(configIconsDir, name);
        this.emitFile({
          type: "asset",
          fileName: `assets/icons/${name}`,
          source: readFileSync(file),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [localConfigPlugin(), configIconsPlugin()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:4317"
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
