import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/services/search-suggestions.ts", import.meta.url), "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;
const {
  COMMON_SITE_SUGGESTIONS,
  getBookmarkSuggestions,
  getHistorySuggestions,
  getSearchSuggestions,
  getWebsiteAliases
} = await import(`data:text/javascript,${encodeURIComponent(transpiled)}`);

const tiles = [
  {
    id: "jira",
    kind: "bookmark",
    title: "Jira",
    subtitle: "example.atlassian.net",
    href: "https://example.atlassian.net/jira",
    layout: { horizontal: "wide", vertical: "wide" }
  },
  {
    id: "forecast",
    kind: "forecast",
    title: "Forecast",
    layout: { horizontal: "forecast", vertical: "forecast" }
  }
];

test("getBookmarkSuggestions only uses bookmark tiles", () => {
  const suggestions = getBookmarkSuggestions(tiles);

  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].title, "Jira");
  assert.equal(suggestions[0].url, "https://example.atlassian.net/jira");
  assert.ok(suggestions[0].aliases.includes("jira"));
  assert.ok(suggestions[0].aliases.includes("example.atlassian.net"));
});

test("getSearchSuggestions ranks exact local matches first", () => {
  const sources = [
    ...getHistorySuggestions([{ title: "Jira board", subtitle: "Recent", value: "jira board" }]),
    ...getBookmarkSuggestions(tiles),
    ...COMMON_SITE_SUGGESTIONS
  ];
  const suggestions = getSearchSuggestions("jira", sources);

  assert.equal(suggestions[0].title, "Jira");
  assert.equal(suggestions[0].kind, "bookmark");
});

test("getWebsiteAliases exposes URL-backed suggestion aliases", () => {
  const aliases = getWebsiteAliases(getBookmarkSuggestions(tiles));

  assert.deepEqual(aliases, [{ aliases: ["jira", "Jira", "example.atlassian.net"], url: "https://example.atlassian.net/jira" }]);
});
