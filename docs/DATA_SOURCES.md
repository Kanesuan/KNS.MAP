# Data sources

Every layer in `src/layers/registry.ts` is listed here with its source, licence and
status. A layer may switch from `status: "sample"` to `"live"` only after the project
owner has confirmed the licence in writing; `npm run check:layers` blocks the build
otherwise.

**Project use: non-commercial** (owner decision, 2026-10-10; `src/layers/project.ts`).
In this mode a live layer needs a checked licence (`commercialUse` "yes" or "no").
Switching back to commercial use makes every layer marked "no" fail the build.

| Layer id | Source | Licence | Commercial use | Status | Notes |
|---|---|---|---|---|---|
| `bkk-zoning-current` | BMA City Planning and Urban Development Department, public ArcGIS service `DOL/LupDolWms`, layer 1 "ผังเมืองรวม 2556" | No licence stated. The plan is enacted as a ministerial regulation (2013-05-16), which the Copyright Act B.E. 2537 s.7 excludes from copyright | No; non-commercial use confirmed by the owner 2026-10-10 | **Live** | `public/data/bkk-zoning-current.geojson`: 498 zones, 1.4 MB, by `scripts/ingest/arcgis-legacy.mjs bkk-zoning` (ArcGIS 10.0: object-id paging, server reprojection from EPSG:32647, Thai digits normalised). The service excludes "ขาว" and "ทหาร" areas |
| `bkk-zoning-draft4` | BMA City Planning and Urban Development Department (draft 4th revision) | Not stated | Unverified: file and permission requested | Sample | No downloadable file found yet |
| `bkk-planned-roads` | Same BMA service, layer 0 "ผังโครงการคมนาคมและขนส่ง" | As above | No; non-commercial, owner confirmed 2026-10-10 | **Live** | `public/data/bkk-planned-roads.geojson`: 136 road projects, right of way 12–60 m, by `scripts/ingest/arcgis-legacy.mjs bkk-roads` |
| `flood-recurrence` | GISTDA Open Data API v1.1 `disasters/flood-recurrence` (2011–2023) | Open Data Common | Yes (owner confirmed 2026-10-10) | **Live** | Called server-side from `/api/inspect` with `GISTDA_API_KEY`. Parser `src/lib/gistda.ts` is written against responses recorded on 2026-10-10 in `tests/fixtures/` |
| `subsidence` | None verified | — | — | Sample | Needs a source usable commercially, or drop the layer |
| `rail-transit` | OpenStreetMap via Overpass API | ODbL 1.0 | Yes, with attribution "© OpenStreetMap contributors" (owner confirmed 2026-10-10) | **Live** | `public/data/rail-transit.geojson`, extracted 2026-10-10 by `scripts/ingest/osm-rail.mjs`: 1,436 line segments, 330 stations, 0.6 MB. Attribution shown on the map |
| `admin-boundary` | Royal Thai Survey Department via OCHA, HDX `cod-ab-tha` (updated 2026-01-26) | CC BY-IGO | Yes, with attribution (owner confirmed 2026-10-10; licence checked by the ingest script) | **Live** | `public/data/admin-boundary.geojson`: 79 districts (ADM2) of the six provinces, 0.28 MB, by `scripts/ingest/hdx-admin.mjs`. Metadata in `tests/fixtures/hdx-cod-ab-tha.json` |

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
