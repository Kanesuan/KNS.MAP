// Calls the GISTDA flood-recurrence API once for a Bangkok point and stores the
// raw response as a test fixture, so the parser is written against real data
// (docs/BRIEF.md section 5). The API key is never written to the fixture.
// Usage: node scripts/ingest/record-gistda-fixture.mjs [lat] [lon]
import { writeFileSync } from "node:fs";
import { loadEnvLocal } from "./env.mjs";

loadEnvLocal();
const key = process.env.GISTDA_API_KEY;
if (!key) {
  console.error("GISTDA_API_KEY is not set (.env.local)");
  process.exit(1);
}
const lat = process.argv[2] ?? "13.7563";
const lon = process.argv[3] ?? "100.5018";
const BASE = "https://api-gateway.gistda.or.th/api/2.0/resources/gi-service";

for (const version of ["v1.1", "v1.0"]) {
  const url = `${BASE}/${version}/disasters/flood-recurrence?lat=${lat}&lon=${lon}&api_key=${key}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const text = await res.text();
  console.log(`${version}: HTTP ${res.status}, ${text.length} bytes`);
  if (!res.ok) continue;
  const body = JSON.parse(text.split(key).join("<redacted>"));
  const out = `tests/fixtures/gistda-flood-recurrence.${version}.json`;
  writeFileSync(
    out,
    `${JSON.stringify({ request: { version, lat: Number(lat), lon: Number(lon) }, recordedAt: new Date().toISOString(), body }, null, 2)}\n`,
  );
  console.log(`saved ${out}`);
  process.exit(0);
}
process.exit(1);
