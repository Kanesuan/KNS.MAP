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
| `flood-recurrence` | GISTDA Open Data API v1.1 `disasters/flood-recurrence` (2011–2023) | Open Data Common | Yes (owner confirmed 2026-10-10) | **Live** | Called server-side from `/api/inspect` with `GISTDA_API_KEY`. Parser `src/lib/gistda.ts` is written against responses recorded on 2026-10-10 in `tests/fixtures/` |
| `subsidence` | None verified | — | — | Sample | Needs a source usable commercially, or drop the layer |
| `rail-transit` | OpenStreetMap via Overpass API | ODbL 1.0 | Yes, with attribution "© OpenStreetMap contributors" (owner confirmed 2026-10-10) | **Live** | `public/data/rail-transit.geojson`, extracted 2026-10-10 by `scripts/ingest/osm-rail.mjs`: 1,436 line segments, 330 stations, 0.6 MB. Attribution shown on the map |
| `admin-boundary` | OCHA COD-AB Thailand on HDX (to be selected) | Per dataset (record when chosen) | To confirm | Sample | |

## Refreshing data

The build sandbox cannot reach the providers, so ingest runs on GitHub Actions
(`.github/workflows/ingest.yml`): set the wanted jobs to `true` in
`scripts/ingest/requests.json` (and bump `run`) on a `claude/**` branch; the workflow
commits the outputs back to that branch. GISTDA calls use the `GISTDA_API_KEY`
repository secret.

## Excluded

- Land parcels and title deeds (LandsMaps or any government site): never scraped or stored.
- Hydro-Informatics Institute (สสน.) sub-district flood-risk dataset: non-commercial licence.

## Basemap and search

- Basemap: OpenFreeMap (free, no key) during development; choose a contracted provider before launch.
- Fonts: Noto Sans Thai, SIL Open Font License 1.1 (`public/fonts/OFL.txt`).
- Place search: public Nominatim (usage-limited, development only); choose a provider before launch.
