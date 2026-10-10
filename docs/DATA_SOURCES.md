# Data sources

Every layer in `src/layers/registry.ts` is listed here with its source, licence and
status. A layer may switch from `status: "sample"` to `"live"` only after the project
owner has confirmed the licence in writing; `npm run check:layers` blocks the build
otherwise.

| Layer id | Source | Licence | Commercial use | Status | Notes |
|---|---|---|---|---|---|
| `bkk-zoning-current` | BMA City Planning and Urban Development Department, "กฎหมายผังเมือง" map service, layer 1 (land-use plan) | Not stated | Unverified: written permission requested | Sample | ArcGIS REST, EPSG:32647, 1,000 records per request. Ingest: `scripts/ingest/arcgis-rest.mjs` |
| `bkk-zoning-draft4` | BMA City Planning and Urban Development Department (draft 4th revision) | Not stated | Unverified: file and permission requested | Sample | No downloadable file found yet |
| `bkk-planned-roads` | Same BMA service, layers 4 and 5 (transport projects) | Not stated | Unverified | Sample | Same ingest as zoning |
| `flood-recurrence` | GISTDA Open Data API `disasters/flood-recurrence` (2011–2023) | Open Data Common | To confirm with GISTDA | Sample (API wired, parser pending) | Called server-side from `/api/inspect`; needs `GISTDA_API_KEY`. Record a real response with `scripts/ingest/record-gistda-fixture.mjs` before writing the parser |
| `subsidence` | None verified | — | — | Sample | Needs a source usable commercially, or drop the layer |
| `rail-transit` | OpenStreetMap via Overpass API | ODbL 1.0 | Yes, with attribution "© OpenStreetMap contributors" | Sample | Ingest: `scripts/ingest/osm-rail.mjs` |
| `admin-boundary` | OCHA COD-AB Thailand on HDX (to be selected) | Per dataset (record when chosen) | To confirm | Sample | |

## Excluded

- Land parcels and title deeds (LandsMaps or any government site): never scraped or stored.
- Hydro-Informatics Institute (สสน.) sub-district flood-risk dataset: non-commercial licence.

## Basemap and search

- Basemap: OpenFreeMap (free, no key) during development; choose a contracted provider before launch.
- Fonts: Noto Sans Thai, SIL Open Font License 1.1 (`public/fonts/OFL.txt`).
- Place search: public Nominatim (usage-limited, development only); choose a provider before launch.
