// Builds public/data/rail-transit.geojson from OpenStreetMap (ODbL, attribution
// required) through the Overpass API. Covers the six provinces of the brief.
// Usage: node scripts/ingest/osm-rail.mjs
import { writeFileSync } from "node:fs";

const BBOX = "13.45,99.85,14.3,101.0"; // south,west,north,east
const QUERY = `[out:json][timeout:120];
(
  way["railway"~"^(subway|light_rail|monorail)$"](${BBOX});
  way["railway"="rail"]["usage"!~"industrial|military|tourism"]["service"!~"."](${BBOX});
);
out tags geom;
(
  node["railway"="station"](${BBOX});
  node["public_transport"="station"]["train"="yes"](${BBOX});
  node["public_transport"="station"]["subway"="yes"](${BBOX});
  node["public_transport"="station"]["monorail"="yes"](${BBOX});
);
out tags;`;

// Public Overpass instances time out under load, so retry and fall back.
const ENDPOINTS = process.env.OVERPASS_URL
  ? [process.env.OVERPASS_URL]
  : [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.private.coffee/api/interpreter",
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    ];

async function query() {
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const endpoint of ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "land-map ingest" },
          body: new URLSearchParams({ data: QUERY }),
        });
        if (res.ok) return await res.json();
        console.warn(`${endpoint}: HTTP ${res.status}`);
      } catch (err) {
        console.warn(`${endpoint}: ${err.message}`);
      }
    }
    await new Promise((r) => setTimeout(r, 15_000 * (attempt + 1)));
  }
  console.error("all Overpass endpoints failed");
  process.exit(1);
}

const { elements } = await query();

const round = (n) => Math.round(n * 1e6) / 1e6;
const features = [];
const seenStations = new Set();
for (const el of elements) {
  const tags = el.tags ?? {};
  const name = tags["name:th"] ?? tags.name ?? null;
  if (el.type === "way" && el.geometry?.length > 1) {
    features.push({
      type: "Feature",
      properties: { kind: "line", line: tags.line ?? tags.name ?? null, railway: tags.railway, osmId: `w${el.id}` },
      geometry: { type: "LineString", coordinates: el.geometry.map((g) => [round(g.lon), round(g.lat)]) },
    });
  } else if (el.type === "node" && name && !seenStations.has(el.id)) {
    seenStations.add(el.id);
    features.push({
      type: "Feature",
      properties: { kind: "station", name, osmId: `n${el.id}` },
      geometry: { type: "Point", coordinates: [round(el.lon), round(el.lat)] },
    });
  }
}

const out = "public/data/rail-transit.geojson";
const json = JSON.stringify({ type: "FeatureCollection", features });
writeFileSync(out, `${json}\n`);
const lines = features.filter((f) => f.properties.kind === "line").length;
console.log(`saved ${out}: ${lines} line segments, ${seenStations.size} stations, ${(json.length / 1e6).toFixed(2)} MB`);
if (json.length > 2e6) console.warn("over 2 MB: convert to PMTiles (scripts/ingest/to-pmtiles.mjs)");
