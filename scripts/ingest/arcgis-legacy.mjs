// Downloads a layer from an old ArcGIS Server (10.0: no GeoJSON output, no
// resultOffset paging) as GeoJSON in EPSG:4326. Pages by object id, converts
// Esri JSON rings/paths to GeoJSON, and applies a per-feature transform.
// Usage: node scripts/ingest/arcgis-legacy.mjs <job>   (jobs defined below)
import { writeFileSync } from "node:fs";

const SERVICE = "http://3d-cpd.bangkok.go.th/ArcGIS/rest/services/DOL/LupDolWms/MapServer";
const THAI_DIGITS = "๐๑๒๓๔๕๖๗๘๙";
const arabic = (s) => s.replace(/[๐-๙]/g, (d) => String(THAI_DIGITS.indexOf(d)));

function zoneCategory(zone) {
  const m = /^(ย|พ|อ|ก|ศ|ส)\.(\d+)/.exec(zone);
  if (!m) return null;
  const n = Number(m[2]);
  switch (m[1]) {
    case "ย":
      return n <= 4 ? "residential_low" : n <= 7 ? "residential_medium" : "residential_high";
    case "พ":
      return "commercial";
    case "อ":
      return n === 3 ? "warehouse" : "industrial";
    case "ก":
      return "agriculture";
    case "ศ":
      return "conservation";
    case "ส":
      return "institutional";
  }
  return null;
}

const ROAD_WIDTH = { ก: 12, ข: 16, ค: 20, ง: 30, จ: 40, ฉ: 50, ช: 60 };

const JOBS = {
  "bkk-zoning": {
    layer: 1,
    out: "public/data/bkk-zoning-current.geojson",
    transform: (a) => {
      const raw = typeof a.ZONE === "string" ? a.ZONE.trim() : "";
      const zone = arabic(raw);
      const category = zoneCategory(zone);
      return category ? { zone, category } : null;
    },
  },
  "bkk-roads": {
    layer: 0,
    out: "public/data/bkk-planned-roads.geojson",
    transform: (a) => {
      const code = typeof a.CODE === "string" ? a.CODE.trim() : "";
      const widthM = ROAD_WIDTH[code] ?? (Number(a.WIDTH) || null);
      if (!code || !widthM) return null;
      const name = typeof a.NAME === "string" && a.NAME.trim() ? arabic(a.NAME.trim()) : null;
      return { code, widthM, name };
    },
  },
};

const job = JOBS[process.argv[2]];
if (!job) {
  console.error(`usage: node scripts/ingest/arcgis-legacy.mjs <${Object.keys(JOBS).join("|")}>`);
  process.exit(1);
}
const layerUrl = `${SERVICE}/${job.layer}`;

async function get(url, params) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ f: "json", ...params }),
        signal: AbortSignal.timeout(60_000),
      });
      const body = await res.json();
      if (body.error) throw new Error(JSON.stringify(body.error));
      return body;
    } catch (err) {
      console.warn(`attempt ${attempt}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
  throw new Error(`failed: ${url}`);
}

const info = await get(layerUrl, {});
console.log(`layer: ${info.name}; fields: ${info.fields.map((f) => f.name).join(", ")}`);
console.log(`definitionExpression: ${info.definitionExpression || "(none)"}`);

const { objectIds } = await get(`${layerUrl}/query`, { where: "1=1", returnIdsOnly: "true" });
console.log(`${objectIds.length} features`);

// Esri: outer rings clockwise, holes counter-clockwise.
const signedArea = (ring) => ring.reduce((s, [x1, y1], i) => {
  const [x2, y2] = ring[(i + 1) % ring.length];
  return s + (x2 - x1) * (y2 + y1);
}, 0);
const inRing = ([x, y], ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
function toGeometry(g) {
  if (g.paths) {
    return g.paths.length === 1
      ? { type: "LineString", coordinates: g.paths[0] }
      : { type: "MultiLineString", coordinates: g.paths };
  }
  if (g.rings) {
    const outers = [];
    const holes = [];
    for (const r of g.rings) (signedArea(r) >= 0 ? outers : holes).push(r);
    const polys = outers.map((o) => [o]);
    for (const h of holes) {
      const owner = polys.find((p) => inRing(h[0], p[0]));
      if (owner) owner.push(h);
    }
    return polys.length === 1
      ? { type: "Polygon", coordinates: polys[0] }
      : { type: "MultiPolygon", coordinates: polys };
  }
  return null;
}

const features = [];
let skipped = 0;
const CHUNK = 200;
for (let i = 0; i < objectIds.length; i += CHUNK) {
  const ids = objectIds.slice(i, i + CHUNK).join(",");
  const page = await get(`${layerUrl}/query`, {
    objectIds: ids,
    outFields: "*",
    outSR: "4326",
    returnGeometry: "true",
    geometryPrecision: "6",
    maxAllowableOffset: "0.00002",
  });
  for (const f of page.features) {
    const props = job.transform(f.attributes);
    const geometry = f.geometry && toGeometry(f.geometry);
    if (!props || !geometry) {
      skipped++;
      continue;
    }
    features.push({ type: "Feature", properties: props, geometry });
  }
  console.log(`${Math.min(i + CHUNK, objectIds.length)}/${objectIds.length}`);
}
const json = JSON.stringify({ type: "FeatureCollection", features });
writeFileSync(job.out, `${json}\n`);
const counts = {};
for (const f of features) {
  const k = f.properties.category ?? f.properties.code;
  counts[k] = (counts[k] ?? 0) + 1;
}
console.log(`saved ${job.out}: ${features.length} features (${skipped} skipped), ${(json.length / 1e6).toFixed(2)} MB`);
console.log(JSON.stringify(counts));
console.log(`sample: ${JSON.stringify(features[0]?.properties)}`);
