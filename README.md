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

## Hosting

Vercel with a preview per PR. Connect this GitHub repo in the Vercel dashboard;
CI runs on GitHub Actions (`.github/workflows/ci.yml`).
