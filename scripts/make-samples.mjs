// Generates the fictional sample datasets in public/data/*.sample.geojson.
// Every shape is made up and sits inside Bangkok. Run: node scripts/make-samples.mjs
import { writeFileSync } from "node:fs";

const round = (n) => Math.round(n * 1e5) / 1e5;
const rect = (w, s, e, n) => [
  [
    [round(w), round(s)],
    [round(e), round(s)],
    [round(e), round(n)],
    [round(w), round(n)],
    [round(w), round(s)],
  ],
];
const fc = (features) => ({ type: "FeatureCollection", features });
const poly = (coords, properties) => ({
  type: "Feature",
  properties,
  geometry: { type: "Polygon", coordinates: coords },
});
const line = (coords, properties) => ({
  type: "Feature",
  properties,
  geometry: { type: "LineString", coordinates: coords.map(([x, y]) => [round(x), round(y)]) },
});

// Zoning grid: 6 columns x 5 rows of 0.03 degree cells over central Bangkok.
const W = 100.46;
const S = 13.7;
const STEP = 0.03;
const ZONES = {
  residential_low: ["ย.2", "ย.3", "ย.4"],
  residential_medium: ["ย.5", "ย.6", "ย.7"],
  residential_high: ["ย.8", "ย.9", "ย.10"],
  commercial: ["พ.2", "พ.3", "พ.5"],
  industrial: ["อ.1", "อ.2", "อ.3"],
  agriculture: ["ก.2", "ก.3", "ก.4"],
  institutional: ["ส."],
};
// Rows from south to north, columns from west to east.
const CURRENT = [
  [
    "agriculture",
    "residential_low",
    "residential_medium",
    "residential_high",
    "industrial",
    "industrial",
  ],
  [
    "residential_low",
    "residential_medium",
    "commercial",
    "commercial",
    "residential_high",
    "industrial",
  ],
  [
    "residential_low",
    "institutional",
    "commercial",
    "commercial",
    "residential_medium",
    "residential_low",
  ],
  [
    "agriculture",
    "residential_low",
    "residential_high",
    "residential_medium",
    "residential_low",
    "agriculture",
  ],
  [
    "agriculture",
    "agriculture",
    "residential_low",
    "residential_low",
    "agriculture",
    "agriculture",
  ],
];
// The draft densifies a few cells around the centre and along the east.
const DRAFT = CURRENT.map((row, r) =>
  row.map((cat, c) => {
    if (cat === "residential_low" && r >= 1 && r <= 3) return "residential_medium";
    if (cat === "residential_medium" && c >= 2 && c <= 4) return "residential_high";
    if (cat === "agriculture" && r === 3) return "residential_low";
    return cat;
  }),
);

const zoning = (grid) =>
  fc(
    grid.flatMap((row, r) =>
      row.map((category, c) => {
        const codes = ZONES[category];
        const zone = codes[(r + c) % codes.length];
        const w = W + c * STEP;
        const s = S + r * STEP;
        return poly(rect(w, s, w + STEP, s + STEP), { zone, category });
      }),
    ),
  );

const plannedRoads = fc([
  line(
    [
      [100.47, 13.745],
      [100.53, 13.748],
      [100.6, 13.752],
      [100.635, 13.755],
    ],
    { code: "ก1", widthM: 16 },
  ),
  line(
    [
      [100.55, 13.705],
      [100.552, 13.76],
      [100.548, 13.84],
    ],
    { code: "ข2", widthM: 20 },
  ),
  line(
    [
      [100.49, 13.82],
      [100.56, 13.805],
      [100.62, 13.79],
    ],
    { code: "ค3", widthM: 30 },
  ),
]);

const subsidence = fc([
  poly(rect(100.47, 13.71, 100.52, 13.76), { rateClass: "lt10" }),
  poly(rect(100.52, 13.71, 100.57, 13.76), { rateClass: "10to20" }),
  poly(rect(100.57, 13.71, 100.63, 13.76), { rateClass: "20to30" }),
  poly(rect(100.57, 13.76, 100.63, 13.8), { rateClass: "gt30" }),
  poly(rect(100.47, 13.76, 100.57, 13.84), { rateClass: "lt10" }),
]);

const admin = fc([
  poly(rect(100.46, 13.7, 100.55, 13.775), { name: "เขตตัวอย่าง 1", province: "กรุงเทพมหานคร" }),
  poly(rect(100.55, 13.7, 100.64, 13.775), { name: "เขตตัวอย่าง 2", province: "กรุงเทพมหานคร" }),
  poly(rect(100.46, 13.775, 100.55, 13.85), { name: "เขตตัวอย่าง 3", province: "กรุงเทพมหานคร" }),
  poly(rect(100.55, 13.775, 100.64, 13.85), { name: "เขตตัวอย่าง 4", province: "กรุงเทพมหานคร" }),
]);

const out = {
  "bkk-zoning-current.sample.geojson": zoning(CURRENT),
  "bkk-zoning-draft4.sample.geojson": zoning(DRAFT),
  "bkk-planned-roads.sample.geojson": plannedRoads,
  "subsidence.sample.geojson": subsidence,
  "admin-boundary.sample.geojson": admin,
};
for (const [name, data] of Object.entries(out)) {
  writeFileSync(`public/data/${name}`, `${JSON.stringify(data)}\n`);
}
console.log(`wrote ${Object.keys(out).length} sample files`);
