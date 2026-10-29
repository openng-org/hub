# Angular Hub

Community-driven data and tools for the Angular ecosystem — [hub.openng.org](https://hub.openng.org).
Every dataset is a file anyone can improve with a pull request, and the site is one consumer of
those packages among others to come (a CLI, an MCP server).

**Events**, **Communities** and **Podcasts** (from [angular-hub](https://github.com/geromegrignon/angular-hub)),
**Can I Use** (feature statuses per version, ng update migrations, the Angular MCP server catalog,
angular-eslint rules) and **Release insights** (what each major brought, with every commit), from
angular.courses. An [OpenNG](https://github.com/openng-org) project.

Contributions are welcome, data first: see [CONTRIBUTING.md](CONTRIBUTING.md). Code is MIT
([LICENSE](LICENSE)); data is CC BY 4.0 ([LICENSE-DATA](LICENSE-DATA)); third-party credits are in
[ATTRIBUTION.md](ATTRIBUTION.md).

## Layout

| Path                             | What it is                                                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `apps/web`                       | The site: Angular 22, SSR + prerender, Optimus UI, Tailwind v4                                        |
| `packages/data-caniuse`          | Curated feature statuses, public API evolution, ng update migrations, ESLint rules                    |
| `packages/data-angular-mcp`      | Catalog of the official Angular MCP server tools/resources per version                                |
| `packages/core-angular-versions` | Angular majors, release dates and support windows, semver helpers, Node/TypeScript/RxJS compatibility |
| `packages/data-community`        | Angular events worldwide, the communities running them, podcasts                                      |
| `packages/data-releases`         | Release announcements, GitHub releases, the commits of every stable release, migration guides         |

Packages are framework-free TypeScript: they run in the browser, in Node, in a CLI and in an MCP
server. All Angular code lives in `apps/web`.

## Running it locally

Prerequisites: Node.js 22 LTS (22.22 or later; `.nvmrc`) and pnpm through corepack (`corepack enable`
installs the version pinned in `package.json`). Nothing else: no database, no API keys.

```sh
corepack enable
pnpm install
pnpm dev                      # the site with SSR at http://localhost:4200
pnpm test                     # vitest everywhere (ng test for the app)
pnpm lint                     # ESLint (angular-eslint)
pnpm check-types
pnpm format                   # Prettier
pnpm build                    # packages (tsup) then the site: prerendered pages, sitemap, OG images
pnpm --filter web serve:ssr   # the built Express server on http://localhost:4000
pnpm --filter web a11y        # axe (WCAG 2.1 AA, light and dark) on the built site
pnpm --filter web e2e         # Playwright: journeys and accessibility, on the built site
```

The two checks need the build and, once, `pnpm --filter web exec playwright install chromium`.
[CONTRIBUTING.md](CONTRIBUTING.md) has the environment variables and the conventions.

## How the pieces fit

**Workspace packages are consumed from source — no build step while developing.** Each package
exports its TypeScript under a `source` condition and its `dist/` for everyone else:

```jsonc
"exports": { ".": { "source": "./src/index.ts", "types": "./dist/index.d.ts", "default": "./dist/index.js" } }
```

Three places have to agree on that condition, and each one covers a different tool:

| Where                                       | Covers                                                                                                                                                                                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsconfig` → `customConditions: ["source"]` | `tsc`, the IDE (go-to-definition lands in `packages/*/src`), Vitest                                                                                                                                                           |
| `angular.json` build → `conditions: [...]`  | `ng build` (esbuild bundles everything with those conditions)                                                                                                                                                                 |
| `angular.json` serve → `prebundle.exclude`  | `ng serve`: the dev server hands dependencies to Vite, which does not know the condition; excluding the workspace packages makes esbuild bundle them from source instead, and edits under `packages/` rebuild the running app |

The rule that follows: a package consumed from source must not pull in runtime dependencies of its own
(the dev server resolves externals from `apps/web`, where pnpm does not expose them). Data packages are
dependency-free by design; shared helpers live in `@openng/core-angular-versions`. `dist/` (tsup) only
matters for publishing to npm.

**The API does the work, the UI renders (the RSC replacement).** Each area has a server folder
(`apps/web/src/server/caniuse/`, `apps/web/src/server/community/`) and a contract of types
(`app/<area>/data/api.ts`); `src/server/api.ts` routes `/api/<area>/…` to them, and the UI talks to
them through one `ApiClient` (caching, transfer state) with an HTTP or in-process transport.

Can I Use: The data packages (≈1 MB of
JSON) never reach the browser bundle. `apps/web/src/server/caniuse/` turns them into UI-ready views:
matrix cells per major, latest status, history, labelled links, the NG Update tree, diff rows. It
also does all searching, filtering, paging and counting. The contract (types only) is
`apps/web/src/app/caniuse/data/api.ts`.

| Endpoint (`/api/caniuse/…`)               | Used by                                                      |
| ----------------------------------------- | ------------------------------------------------------------ |
| `summary`                                 | `/caniuse` badges (totals) and package filter options        |
| `counts?search=`                          | tab badges while a search is active                          |
| `features?search=&package=&status=&page=` | the features matrix, 20 rows per page, fetched as you scroll |
| `features/<id>`                           | the detail drawer and `/caniuse/<id>`                        |
| `migrations?search=`                      | the NG Update tree (which versions start open included)      |
| `migrations/major/<N>`                    | `/caniuse/update/<N>`                                        |
| `migrations/<repo>/<name>`                | `/caniuse/update/migrations/<repo>/<name>`                   |
| `mcp?search=`, `eslint?search=&type=`     | the MCP and ESLint tabs                                      |

- `handle.ts` is the area's routing table: `src/server.ts` serves it over HTTP, and during
  SSR/prerender `ServerApiTransport` calls it in-process (no HTTP round trip).
- The API services (`CaniuseApi`, `CommunityApi`, `ReleasesApi`, `HomeApi`) make each request once
  per app instance and write it to `TransferState` during SSR, so hydration makes zero requests.
  Tabs fetch their own view with `resource()`, keyed on the debounced search in the URL.
- Search and filters need the Node server at runtime; prerendered pages still load without it.
- Each tab is a route (`/caniuse`, `/caniuse/update`, `/caniuse/mcp`, `/caniuse/eslint`) with its
  own title and canonical URL; the search and filters are query parameters shared by all four.
  The panels are wrapped in `<ng-template #content>`: Optimus' `lazy` tabs still instantiate
  projected content, and a plain `@if` would fetch every tab's view up front.
- `apps/web/src/app/core/query-params.ts` holds the mechanics every list page shares: URL-backed
  filters (`injectQueryParams`), the debounced search box, the "latest value" of a resource (kept
  while the next page loads or a load fails) and "load more" paging (`pagedResource`). The
  loading, empty and error states are the `hub-loading`, `hub-empty-state` and `hub-load-error`
  components in `apps/web/src/app/ui/`.
- `apps/web/src/app/ui/status-style.ts` is the only status logic left in the UI: icons, colours,
  legend and tooltip copy.

Community (`/api/community/…`): `events?when=&type=&format=&search=&page=` (upcoming soonest
first, past newest first and paged, grouped by month with every label ready),
`events/map?when=&type=&format=&search=` (one marker per city on a 1° pixel world map, with the
zoom regions; coordinates live in `packages/data-community/data/places.json`, the land outline in
`apps/web/src/app/community/ui/world-land.ts`, generated by `apps/web/scripts/world-map.py`),
`communities?country=&search=` (groups meeting soon first, with their next event), `podcasts`, and
`contribute` (what the contribution form checks against). "Upcoming" depends on today's date, so
`/events` and `/communities` render per request instead of being prerendered.

Release insights (`/api/releases/…`): `<major>` (summary: sections with counts, links),
`<major>/features?status=`, `<major>/guide?criticality=&difficulty=&impact=`, `<major>/update`,
`<major>/commits?search=&type=&package=&version=&page=` (50 per page), `<major>/mcp`,
`<major>/eslint`, `<major>/changelogs?channel=`. Feature stage changes, NG Update, MCP and ESLint
are views of the Can I Use data; commits (`data/commits.json`, ~1.2 MB, stable releases only) and
GitHub releases come from the angular.courses commit tracker and never reach the browser. Every
`/releases/<major>/<section>` page is prerendered.

Home (`/api/home`): the scoreboard counters and the release timeline — every major placed on one
axis (release dates and active/LTS windows from `ANGULAR_RELEASES` in
`packages/core-angular-versions/src/support.ts`, end dates copied from
[angular.dev/reference/releases](https://angular.dev/reference/releases); update it with each
major). Support statuses depend on today, so `/` renders per request too.

**Rendering.** `app.routes.server.ts` prerenders every data-driven route at build time
(`getPrerenderParams` lists the feature, migration and version pages from the server views);
unknown URLs render on the server with a 404. A data change is a PR, a merge is a rebuild.

**UI.** Optimus UI only (`@openng/optimus-ui`, `@openng/icons`) plus Tailwind v4 with the
`@openng/optimus-ui-tailwindcss` plugin. `apps/web/src/app/theme.ts` composes the Aura preset from
the per-component entries of the components the app actually imports — the full preset ships the
tokens of ~90 components; add an entry there when you import a new one. The same file sets the
primary palette to the magenta of the logo (`#bf25b9`), so buttons, links, badges and focus rings follow
the brand. Tables are plain `<table>`s:
the status matrix is one DOM that turns into cards below 1300px (`.hub-matrix` in
`styles/caniuse.css`), with a single delegated tooltip for all cells. The status palette lives in
`styles.css` as Tailwind theme tokens built on Optimus primitives, so it follows the preset and dark
mode; the rest of the CSS is one partial per area under `src/styles/`, imported from `styles.css` in
cascade order.

**Light and dark.** Dark mode is the `.hub-dark` class on `<html>`: an inline script in
`index.html` sets it before the first paint from the visitor's choice (the header toggle, saved in
`localStorage`) or, without one, the OS setting. Tailwind's `dark:` variant (`@custom-variant` in
`styles.css`), Optimus (`darkModeSelector`) and the hub's own rules (`.hub-dark { … }`) all follow it.
CI runs the accessibility checks (`apps/web/e2e/a11y.spec.ts`) in both themes, so a contrast
regression fails the build.

**Search and sharing.** Pages set their title, description, canonical URL, Open Graph/Twitter tags
and JSON-LD through `app/core/seo.ts` (`pageSeo()`); the JSON-LD comes from the API (`server/seo.ts`:
schema.org `Event`s on /events, `TechArticle` on feature and release pages, `WebSite` on home).
`pnpm --filter web build` runs `scripts/postbuild.mjs` after `ng build`: `sitemap.xml` and
`robots.txt` from the prerender list, and a pixel-style 1200×630 image per page kind, feature and
release in `og/` (resvg, fonts in `scripts/og/`).

**Feeds.** `/calendar/events.ics` (every event of the last 90 days and to come), one calendar per
community (`/calendar/<id>.ics`, linked from its card) and `/feed.xml` (RSS: upcoming events and open
calls for papers), served by `src/server.ts`.

## Deploying (Vercel)

The site deploys as one Vercel project with **Root Directory** `apps/web`; `apps/web/vercel.json`
holds the rest:

- the build runs from the monorepo root (`pnpm turbo run build --filter=web`), so the workspace
  packages build first;
- `dist/web/browser` (assets and the prerendered pages) is served by Vercel's CDN;
- every other request is rewritten to the `api/index.mjs` function, which loads the Express app
  from `dist/web/server/server.mjs` (`includeFiles`): the API (`/api/...`) and server-side
  rendering (`/events`, `/communities`, filters, 404s).

`angular.json` lists the hosts SSR accepts (`security.allowedHosts`): `hub.openng.org`,
`*.openng.org` and `*.vercel.app` for preview deployments. Add any other domain there.

## Contributing

**Data, from the site:** `/contribute` (the "Add your event / community / podcast" buttons) builds
the entry, checks it with the dataset's own rules (`@openng/data-community/validate`, the code the
tests and the merge script use too) and opens GitHub's new-file page with
`packages/data-community/data/inbox/<file>.json` filled in: committing it there proposes the pull
request, fork included. CI validates inbox files; before merging, a maintainer runs
`pnpm --filter @openng/data-community merge-inbox` on the branch, which moves them into
`events.json`, `organizers.json`, `podcasts.json` (and `places.json` for a new city).

**Data by hand, and code:** every dataset has a `vitest` suite that validates it, so a broken entry
fails CI before it reaches the site. Where each file lives, the rules, the conventions and the pull
request checklist are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Code: [MIT](LICENSE). Data (`packages/*/data`, the curated lists): [CC BY 4.0](LICENSE-DATA).
Logos belong to their owners; fonts are under the SIL Open Font License; see
[ATTRIBUTION.md](ATTRIBUTION.md).
