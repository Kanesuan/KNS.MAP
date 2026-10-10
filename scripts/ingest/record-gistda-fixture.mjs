// Calls the GISTDA flood-recurrence API for a few points and stores each raw
// response as a test fixture, so the parser is written against real data
// (docs/BRIEF.md section 5). The API key is never written to the fixtures.
// Usage: node scripts/ingest/record-gistda-fixture.mjs [lat,lon ...]
import { mkdirSync, writeFileSync } from "node:fs";
import { loadEnvLocal } from "./env.mjs";

loadEnvLocal();
const key = process.env.GISTDA_API_KEY;
if (!key) {
  console.error("GISTDA_API_KEY is not set (.env.local)");
  process.exit(1);
}
const BASE =
  "https://api-gateway.gistda.or.th/api/2.0/resources/gi-service/v1.1/disasters/flood-recurrence";
// Default points: central Bangkok (dry) plus areas that flooded in 2011.
const points =
  process.argv.length > 2
    ? process.argv.slice(2)
    : [
        "13.7563,100.5018",
        "13.8600,100.8300",
        "13.9200,100.4000",
        "14.0500,100.6200",
        "13.7000,100.3000",
      ];

mkdirSync("tests/fixtures", { recursive: true });
let saved = 0;
for (const point of points) {
  const [lat, lon] = point.split(",");
  const res = await fetch(`${BASE}?lat=${lat}&lon=${lon}&api_key=${key}`, {
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  console.log(`${lat},${lon}: HTTP ${res.status}, ${text.length} bytes`);
  if (!res.ok) continue;
  const body = JSON.parse(text.split(key).join("<redacted>"));
  const out = `tests/fixtures/gistda-flood-recurrence_${lat}_${lon}.json`;
  const fixture = {
    request: { version: "v1.1", lat: Number(lat), lon: Number(lon) },
    recordedAt: new Date().toISOString(),
    body,
  };
  writeFileSync(out, `${JSON.stringify(fixture, null, 2)}\n`);
  saved++;
}
console.log(`saved ${saved} fixtures`);
process.exit(saved > 0 ? 0 : 1);
