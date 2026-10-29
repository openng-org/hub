# Attribution

Angular Hub is built from, and on top of, the work of others. This file lists what is included or
derived, and under which terms. See `LICENSE` (code, MIT) and `LICENSE-DATA` (datasets, CC BY 4.0)
for the project's own licences.

## Data derived from other projects

- **Angular** (https://github.com/angular/angular and https://github.com/angular/angular-cli,
  MIT, © Google LLC): the commit subjects and links in `packages/data-releases/data/commits.json`,
  the GitHub releases in `packages/data-releases/data/github-releases.json`, the deprecated public
  APIs in `packages/data-caniuse/data/api-deprecations.json`, and the ng update migrations in
  `packages/data-caniuse/data/angular-migrations*.json` are extracted from those repositories
  (`packages/data-sync`) and from the published packages.
- **npm** (https://www.npmjs.com) and the **GitHub Advisory Database**
  (https://github.com/advisories, CC BY 4.0): the versions, peer ranges, download counts and
  advisories of each library in `packages/data-libraries/data/health.json` are read from the npm
  registry and the advisory database (`packages/data-sync`).
- **angular-eslint** (https://github.com/angular-eslint/angular-eslint, MIT): the rule names,
  versions and documentation links in `packages/data-caniuse/src/eslint/data.ts`.
- **Angular CLI MCP server** (https://angular.dev/ai/mcp): the tools and resources catalogued in
  `packages/data-caniuse/src/mcp/data.ts`.
- **global-land-mask** (https://github.com/toddkarin/global-land-mask, MIT, © Todd Karin): the
  land cells of the events map (`apps/web/src/app/features/community/components/world-land.ts`) are generated from
  its land mask by `apps/web/scripts/world-map.py`.
- **Events, communities and podcasts**: curated by the Angular Hub contributors from public
  announcements, the communities' own pages and the podcasts' feeds, originally in
  https://github.com/geromegrignon/angular-hub.

## Logos

The files under `apps/web/public/logos/` are the logos of the communities and podcasts listed on the
site. They belong to their respective owners and are shown for identification only; they are not
covered by the project's licences. Owners who prefer not to be shown can open an issue or email
openng.foundation@gmail.com and the logo will be removed.

## Fonts

- **Jersey 10** by Sarah Cadigan-Fried (https://github.com/scfried/soft-type-jersey), SIL Open Font
  License 1.1 — `apps/web/public/fonts/jersey-10-latin.woff2` and
  `apps/web/scripts/og/Jersey10-Regular.ttf`.
- **Inter** by Rasmus Andersson (https://github.com/rsms/inter), SIL Open Font License 1.1 —
  `apps/web/scripts/og/Inter.ttf`.

The licence text is in `OFL.txt` next to each font.

## Software

Angular Hub is an Angular application using Optimus UI and the OpenNG icon font
(https://github.com/openng-org), Tailwind CSS, Express, resvg, axe-core and Playwright, each under
its own licence as declared in `pnpm-lock.yaml`.
