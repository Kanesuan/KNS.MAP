// Converts a GeoJSON file to PMTiles with tippecanoe (must be installed).
// Usage: node scripts/ingest/to-pmtiles.mjs <in.geojson> <out.pmtiles> <layer-name>
import { execFileSync } from "node:child_process";

const [input, output, layer] = process.argv.slice(2);
if (!input || !output || !layer) {
  console.error("usage: node scripts/ingest/to-pmtiles.mjs <in.geojson> <out.pmtiles> <layer-name>");
  process.exit(1);
}
execFileSync(
  "tippecanoe",
  ["-o", output, "-l", layer, "-zg", "--drop-densest-as-needed", "--force", input],
  { stdio: "inherit" },
);
