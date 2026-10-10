// Downloads one layer of an ArcGIS REST MapServer/FeatureServer as GeoJSON in
// EPSG:4326, paging with resultOffset (the BMA service returns at most 1,000
// records per request). Run ONLY for a layer whose licence the project owner has
// confirmed in writing (CLAUDE.md, Data rules).
// Usage: node scripts/ingest/arcgis-rest.mjs <layer-url> <out.geojson>
import { writeFileSync } from "node:fs";

const [layerUrl, out] = process.argv.slice(2);
if (!layerUrl || !out) {
  console.error("usage: node scripts/ingest/arcgis-rest.mjs <layer-url> <out.geojson>");
  process.exit(1);
}

const PAGE = 1000;
const features = [];
for (let offset = 0; ; offset += PAGE) {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    outSR: "4326",
    f: "geojson",
    resultOffset: String(offset),
    resultRecordCount: String(PAGE),
    orderByFields: "OBJECTID",
  });
  const res = await fetch(`${layerUrl.replace(/\/$/, "")}/query?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} at offset ${offset}`);
  const page = await res.json();
  if (page.error) throw new Error(`ArcGIS error: ${JSON.stringify(page.error)}`);
  features.push(...(page.features ?? []));
  console.log(`offset ${offset}: ${page.features?.length ?? 0} features`);
  const more = page.exceededTransferLimit || page.properties?.exceededTransferLimit;
  if (!more && (page.features?.length ?? 0) < PAGE) break;
}
writeFileSync(out, `${JSON.stringify({ type: "FeatureCollection", features })}\n`);
console.log(`saved ${out}: ${features.length} features`);
