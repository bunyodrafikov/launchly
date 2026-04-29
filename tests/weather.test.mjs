import assert from "node:assert/strict";
import test from "node:test";
import { cardinalFromDegrees, weatherIconFromCode } from "../server/http.mjs";

test("cardinalFromDegrees normalizes compass points", () => {
  assert.equal(cardinalFromDegrees(0), "N");
  assert.equal(cardinalFromDegrees(90), "E");
  assert.equal(cardinalFromDegrees(225), "SW");
  assert.equal(cardinalFromDegrees(359), "N");
});

test("weatherIconFromCode maps open-meteo conditions", () => {
  assert.equal(weatherIconFromCode(0), "sun");
  assert.equal(weatherIconFromCode(2), "partly-cloudy");
  assert.equal(weatherIconFromCode(61), "rain");
  assert.equal(weatherIconFromCode(95), "storm");
});
