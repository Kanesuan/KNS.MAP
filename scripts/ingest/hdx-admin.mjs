// Builds public/data/admin-boundary.geojson from the OCHA COD-AB Thailand
// dataset on HDX (source: Royal Thai Survey Department). Districts (ADM2) of the
// six provinces in the brief. Stops unless HDX still lists the licence the owner
// confirmed. Needs ogr2ogr (GDAL).
// Usage: node scripts/ingest/hdx-admin.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const EXPECTED_LICENCE = /Creative Commons Attribution for Intergovernmental Organisations/i;
const PROVINCES = ["TH10", "TH11", "TH12", "TH13", "TH73", "TH74"];
const TMP = "tmp/hdx";
mkdirSync(TMP, { recursive: true });

const pkgRes = await fetch("https://data.humdata.org/api/3/action/package_show?id=cod-ab-tha");
if (!pkgRes.ok) throw new Error(`HDX package_show HTTP ${pkgRes.status}`);
const pkg = (await pkgRes.json()).result;
console.log(`dataset: ${pkg.title}`);
console.log(`licence: ${pkg.license_title}`);
console.log(`source: ${pkg.dataset_source} | updated: ${pkg.last_modified} | dataset date: ${pkg.dataset_date}`);
for (const r of pkg.resources) console.log(`resource: ${r.name} | ${r.format} | ${r.url}`);
mkdirSync("tests/fixtures", { recursive: true });
writeFileSync(
  "tests/fixtures/hdx-cod-ab-tha.json",
  `${JSON.stringify(
    {
      recordedAt: new Date().toISOString(),
      title: pkg.title,
      license_title: pkg.license_title,
      dataset_source: pkg.dataset_source,
      last_modified: pkg.last_modified,
      dataset_date: pkg.dataset_date,
      resources: pkg.resources.map((r) => ({ name: r.name, format: r.format, url: r.url })),
    },
    null,
    2,
  )}\n`,
);
if (!EXPECTED_LICENCE.test(pkg.license_title ?? "")) {
  console.error("licence differs from the one the owner confirmed; stopping");
  process.exit(1);
}

// Prefer a shapefile or GeoJSON bundle; geodatabases need extra drivers.
const pick =
  pkg.resources.find((r) => /shp|shapefile/i.test(`${r.format} ${r.name}`) && /zip$/i.test(r.url)) ??
  pkg.resources.find((r) => /geojson/i.test(`${r.format} ${r.name}`)) ??
  pkg.resources.find((r) => /zip$/i.test(r.url));
if (!pick) throw new Error("no usable resource");
console.log(`using: ${pick.name} (${pick.url})`);
const file = `${TMP}/${pick.url.split("/").pop().split("?")[0]}`;
const dl = await fetch(pick.url);
if (!dl.ok) throw new Error(`download HTTP ${dl.status}`);
writeFileSync(file, Buffer.from(await dl.arrayBuffer()));

const src = file.endsWith(".zip") ? `/vsizip/${file}` : file;
const info = execFileSync("ogrinfo", ["-ro", "-so", "-q", src], { encoding: "utf8" });
console.log(info);
const layer = info
  .split("\n")
  .map((l) => /^\d+:\s*(\S+)/.exec(l)?.[1])
  .find((name) => name && /adm(in)?2$/i.test(name));
if (!layer) throw new Error("no ADM2 layer found");
console.log(`ADM2 layer: ${layer}`);

// Field names differ between COD-AB releases (ADM2_TH vs adm2_name1, ...),
// so read them from the layer instead of assuming.
const layerInfo = execFileSync("ogrinfo", ["-ro", "-so", src, layer], { encoding: "utf8" });
const fields = [...layerInfo.matchAll(/^(\w+): \w+/gm)].map((m) => m[1]);
console.log(`fields: ${fields.join(", ")}`);
const field = (...patterns) => {
  for (const p of patterns) {
    const hit = fields.find((f) => p.test(f));
    if (hit) return hit;
  }
  throw new Error(`no field matching ${patterns.join(" or ")}`);
};
const f = {
  nameTh: field(/^adm2_th$/i, /^adm2_name1$/i),
  nameEn: field(/^adm2_en$/i, /^adm2_name$/i),
  pcode: field(/^adm2_pcode$/i),
  provinceTh: field(/^adm1_th$/i, /^adm1_name1$/i),
  provincePcode: field(/^adm1_pcode$/i),
};
console.log(`using fields: ${JSON.stringify(f)}`);

const out = "public/data/admin-boundary.geojson";
const where = `${f.provincePcode} IN (${PROVINCES.map((p) => `'${p}'`).join(",")})`;
execFileSync(
  "ogr2ogr",
  [
    "-f", "GeoJSON", "-t_srs", "EPSG:4326", "-lco", "COORDINATE_PRECISION=5", "-simplify", "0.0001",
    "-sql", `SELECT ${f.nameTh} AS name, ${f.nameEn} AS name_en, ${f.pcode} AS pcode, ${f.provinceTh} AS province, ${f.provincePcode} AS province_pcode FROM "${layer}" WHERE ${where}`,
    out, src,
  ],
  { stdio: "inherit" },
);
const fc = JSON.parse(readFileSync(out, "utf8"));
writeFileSync(out, `${JSON.stringify({ type: "FeatureCollection", features: fc.features })}\n`);
const provinces = new Set(fc.features.map((f) => f.properties.province));
if (fc.features.length === 0) throw new Error("no districts matched the province codes");
console.log(`sample: ${JSON.stringify(fc.features[0].properties)}`);
console.log(`saved ${out}: ${fc.features.length} districts in ${provinces.size} provinces, ${(readFileSync(out).length / 1e6).toFixed(2)} MB`);
