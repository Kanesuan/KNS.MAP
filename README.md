# land-map

Full-screen web map for land buyers in the Bangkok Metropolitan Region.
Scope, screens, layers and milestones: [docs/BRIEF.md](docs/BRIEF.md).
Working rules for Claude Code: [CLAUDE.md](CLAUDE.md).

## Setup

```bash
nvm use            # Node 22
npm install
cp .env.example .env.local   # fill GISTDA_API_KEY before M3
npm run dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run lint` | ESLint (no `any`) |
| `npm run typecheck` | `tsc --noEmit`, strict mode |
| `npm test` | Unit tests (Vitest, `tests/unit`) |
| `npm run test:e2e` | End-to-end tests (Playwright, 360×640 and 1440×900) against a production build; run `npm run build` first |
| `npm run check:layers` | Validate the layer registry and licences (placeholder until M2/M4; runs before every build) |
| `npm run build` | Production build |

If Playwright cannot download a browser, point it at a local Chromium with
`PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome npm run test:e2e`.

## Notes

- **Thai map labels.** SDF glyph PBFs draw Thai vowels and tone marks as separate
  glyphs, so they overlap. `src/lib/basemap.ts` adds a `font-faces` entry for the
  Thai block pointing at self-hosted Noto Sans Thai (`public/fonts`, SIL OFL), so
  MapLibre renders each grapheme cluster with the browser's text engine.
- **MapLibre worker.** `postinstall`/`predev`/`prebuild` copy the standalone worker
  to `public/vendor/maplibre/` (git-ignored); bundling breaks its default URL.
- **Place search** goes through `/api/geocode` (server-side Nominatim, cached 24h,
  submit-only as the public Nominatim policy requires).
- **E2E tests** replace the basemap with `tests/e2e/fixtures/test-style.json`, so they
  run offline and never hit the tile provider.

## Hosting

Vercel with a preview per PR. Connect this GitHub repo in the Vercel dashboard;
CI runs on GitHub Actions (`.github/workflows/ci.yml`).
