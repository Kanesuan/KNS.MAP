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
  .find((name) => name && /adm2/i.test(name));
if (!layer) throw new Error("no ADM2 layer found");
console.log(`ADM2 layer: ${layer}`);

const out = "public/data/admin-boundary.geojson";
const where = `ADM1_PCODE IN (${PROVINCES.map((p) => `'${p}'`).join(",")})`;
execFileSync(
  "ogr2ogr",
  [
    "-f", "GeoJSON", "-t_srs", "EPSG:4326", "-lco", "COORDINATE_PRECISION=5", "-simplify", "0.0001",
    "-sql", `SELECT ADM2_TH AS name, ADM2_EN AS name_en, ADM2_PCODE AS pcode, ADM1_TH AS province, ADM1_PCODE AS province_pcode FROM "${layer}" WHERE ${where}`,
    out, src,
  ],
  { stdio: "inherit" },
);
const fc = JSON.parse(readFileSync(out, "utf8"));
writeFileSync(out, `${JSON.stringify({ type: "FeatureCollection", features: fc.features })}\n`);
const provinces = new Set(fc.features.map((f) => f.properties.province));
console.log(`saved ${out}: ${fc.features.length} districts in ${provinces.size} provinces, ${(readFileSync(out).length / 1e6).toFixed(2)} MB`);
