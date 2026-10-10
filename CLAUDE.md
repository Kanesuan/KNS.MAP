# CLAUDE.md

## Project
Full-screen web map that lets land buyers in the Bangkok Metropolitan Region
toggle zoning and hazard layers and tap any point for a plain-language summary.
Read docs/BRIEF.md before any work. It is the source of truth for scope,
screens, layers and milestones.

## Commands
- npm run dev            start the app
- npm run lint           lint
- npm run typecheck      type check
- npm test               unit tests (Vitest)
- npm run test:e2e       end-to-end tests (Playwright)
- npm run check:layers   validate the layer registry and licences
- npm run build          production build

## Working agreements
- Work on one milestone from docs/BRIEF.md section 6 at a time.
  Open one PR per milestone, then stop and wait for review.
- Before finishing, run lint, typecheck, test and build.
  Report what you ran and the result.
- Attach desktop (1440x900) and mobile (360x640) screenshots to every PR
  that changes the UI.
- If the brief is ambiguous or two requirements conflict, ask. Do not guess.
- Ask before adding a production dependency or any paid service.

## Code rules
- TypeScript strict. No `any`.
- All on-screen text is Thai and lives in src/i18n/th.ts.
  Code, comments and commit messages are in English.
- A layer is defined only in src/layers/registry.ts.
  Components must not contain logic for a specific layer id.
- The map always fills the viewport. No page-level scrolling.

## Data rules
- Use only the sources listed in docs/BRIEF.md section 5 and record each
  one in docs/DATA_SOURCES.md.
- Never scrape government websites or LandsMaps.
  Never add land-parcel or title-deed data.
- Sample data must have status "sample", a .sample.geojson file name,
  and the sample badge in the UI.
- Do not ingest real data for a layer until the project owner confirms
  the licence in writing.

## Secrets
- Keys live in .env.local only. Never commit them and never prefix them
  with NEXT_PUBLIC_.
- External APIs are called from route handlers in src/app/api/,
  never from the browser.
