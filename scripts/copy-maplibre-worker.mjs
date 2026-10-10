// MapLibre resolves its web worker relative to its own module URL, which breaks
// once Next.js bundles it. Serve the standalone worker as a static file instead.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const dist = path.dirname(require.resolve("maplibre-gl/dist/maplibre-gl.mjs"));
const out = path.resolve("public/vendor/maplibre");
mkdirSync(out, { recursive: true });
copyFileSync(path.join(dist, "maplibre-gl-worker.mjs"), path.join(out, "maplibre-gl-worker.mjs"));
