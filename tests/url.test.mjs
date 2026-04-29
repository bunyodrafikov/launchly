import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/services/url.ts", import.meta.url), "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;
const { getWebsiteUrl } = await import(`data:text/javascript,${encodeURIComponent(transpiled)}`);

test("getWebsiteUrl normalizes website-like input", () => {
  assert.equal(getWebsiteUrl("example.com"), "https://example.com/");
  assert.equal(getWebsiteUrl("www.example.com/path?q=1"), "https://www.example.com/path?q=1");
  assert.equal(getWebsiteUrl("http://localhost:5173"), "http://localhost:5173/");
  assert.equal(getWebsiteUrl("192.168.1.10:8080"), "https://192.168.1.10:8080/");
});

test("getWebsiteUrl rejects search-like input", () => {
  assert.equal(getWebsiteUrl("launchly dashboard"), null);
  assert.equal(getWebsiteUrl("example"), null);
  assert.equal(getWebsiteUrl("example.c"), null);
  assert.equal(getWebsiteUrl("ftp://example.com"), null);
});
