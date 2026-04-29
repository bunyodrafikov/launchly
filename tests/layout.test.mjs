import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/components/dashboard.ts", import.meta.url), "utf8");

test("layout mode switches at wide landscape threshold", () => {
  assert.match(source, /width >= height && width >= 1020/);
});
