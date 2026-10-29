# Contributing to Angular Hub

Thanks for helping. Angular Hub is community-driven data about the Angular ecosystem (events,
communities, podcasts, feature support, releases) and the site that shows it, hub.openng.org. Most
contributions are data: a missing meetup, a wrong date, a new podcast. Code contributions are
welcome too.

This project follows the [OpenNG Code of Conduct](https://github.com/openng-org/.github/blob/main/CODE_OF_CONDUCT.md)
and the general [OpenNG contributing guide](https://github.com/openng-org/.github/blob/main/CONTRIBUTING.md)
(Conventional Commits, small focused pull requests, discuss big changes in an issue first). Security
issues go through [SECURITY.md](SECURITY.md), never through public issues.

## Contributing data

### From the site (no setup needed)

The [Add to the hub](https://hub.openng.org/contribute) page builds the entry for an event, a
community or a podcast, checks it with the dataset's own rules, and opens GitHub's new-file page
with `packages/data-community/data/inbox/<file>.json` filled in. Committing it there proposes the
pull request, fork included. CI validates inbox files; a maintainer merges them into the datasets
with `pnpm --filter @openng/data-community merge-inbox` before merging the pull request.

### By hand

Datasets are JSON files (and two curated TypeScript lists) under `packages/*`:

| Data                                           | File                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| Events                                         | `packages/data-community/data/events.json`                         |
| Communities (organizers)                       | `packages/data-community/data/organizers.json`                     |
| Podcasts                                       | `packages/data-community/data/podcasts.json`                       |
| Coordinates of on-site locations               | `packages/data-community/data/places.json` (`[lat, lng]`)          |
| Logos of communities and podcasts              | `apps/web/public/logos/<id>.webp` (or `.svg`), ~256 px, no padding |
| Can I Use: curated feature statuses            | `packages/data-caniuse/src/caniuse.ts`                             |
| Can I Use: angular-eslint rules                | `packages/data-caniuse/src/eslint/data.ts`                         |
| Can I Use: ng update migrations                | `packages/data-caniuse/data/angular-migrations*.json`              |
| Angular MCP server catalog                     | `packages/data-angular-mcp/src/`                                   |
| Releases, GitHub releases, migration guides    | `packages/data-releases/data/`, `src/migration-guides/`            |
| Angular majors, support windows, compatibility | `packages/core-angular-versions/src/`                              |

Rules that matter:

- Every dataset has a `vitest` suite (`pnpm test`) that validates it: ids are unique, dates are ISO
  days, URLs are https, statuses are known, an event's organizer exists, an on-site event has a
  location with coordinates in `places.json`, and so on. Run it before opening the pull request;
  CI runs it too. The rules the site's form applies are in `packages/data-community/src/validate.ts`.
- Events: one entry per edition. A recurring meetup without a specific title can leave `name`
  empty, the site then shows the organizer's name. Use `callForPapersUrl`/`callForPapersDueDate`
  when speakers are wanted. Prices are a starting price plus an ISO 4217 `currency`; free events set
  `isFree: true`.
- Communities and podcasts need a logo: a square `.webp` (or `.svg`) named after the entry's id.
- Can I Use features follow the Angular versions in `packages/core-angular-versions`: list a status
  for every major from the first one that matters, in ascending order, with the commit or
  documentation link when you have it.
- New Angular major: add its release date to `packages/core-angular-versions/src/support.ts` (and
  the previous majors' LTS dates from [angular.dev/reference/releases](https://angular.dev/reference/releases)),
  the version to `versions.ts` and `compatibility.ts`, then the release itself to
  `packages/data-releases/data/releases.json`.

Data is published under CC BY 4.0 ([LICENSE-DATA](LICENSE-DATA)); by contributing data you agree
to that licence. Logos stay the property of their owners (see [ATTRIBUTION.md](ATTRIBUTION.md)).

## Contributing code

### Prerequisites

- Node.js 22 LTS (22.22 or later; `.nvmrc` has the major). Node 24 works too.
- pnpm, through corepack: `corepack enable` picks the version pinned in `package.json`
  (`packageManager`). pnpm 10+ is required.
- Python 3 with `global-land-mask` and `numpy` only if you regenerate the events map
  (`apps/web/scripts/world-map.py`).

### Setup and commands

```sh
corepack enable
pnpm install
pnpm dev                        # the site with SSR at http://localhost:4200, rebuilds on change
pnpm test                       # every test suite (vitest; `ng test` for the app)
pnpm test:coverage              # the same with coverage thresholds, as CI runs it
pnpm lint                       # ESLint (angular-eslint) everywhere
pnpm check-types                # tsc on every package and the app
pnpm format                     # Prettier (CI checks it with `pnpm format:check`)
pnpm build                      # packages (tsup) then the site, prerendered, with sitemap and OG images
pnpm --filter web serve:ssr     # the built Express server on http://localhost:4000 (after `pnpm build`)
pnpm --filter web a11y          # axe (WCAG 2.1 AA, light and dark) on the built site (after `pnpm build`;
                                # first time: `pnpm --filter web exec playwright install chromium`)
pnpm --filter web e2e           # Playwright: the journeys and the accessibility checks (same prerequisites)
```

`pnpm test` goes through Turborepo, which builds the packages first: the app's tests import them
from `dist/`, so after changing a package run `pnpm test` (or `pnpm build`) rather than
`ng test` alone.

Environment variables, all optional: `PORT` (the built server, default 4000), `POSTBUILD_PORT`
(the build's own server while it draws OG images, default 4500) and `E2E_PORT`/`E2E_URL` (the
Playwright checks start their own server on 4400 unless a URL is given).

### How the code is organised

Read the "How the pieces fit" section of the [README](README.md) first. In short:

- `packages/*` are framework-free TypeScript consumed from source; they must not add runtime
  dependencies (see the README for why). Shared helpers go to `@openng/core-angular-versions`.
- The server (`apps/web/src/server/`) turns the datasets into UI-ready views; the UI
  (`apps/web/src/app/`) renders them through one `ApiClient`. New data never reaches the browser
  bundle: add a server view and a typed contract in `app/<area>/data/api.ts` instead.
- The UI uses Optimus UI and Tailwind only, modern Angular (standalone, signals, `input()`,
  `resource()`, control flow, zoneless), and must work server-side (no `window` outside
  `afterNextRender`/platform checks). Every page sets its SEO with `pageSeo()`.
- Light and dark mode both have to pass the accessibility check; write dark rules as
  `.hub-dark { … }` and prefer theme tokens over colours.

### Pull requests

1. Branch from `main`; keep the pull request focused on one change.
2. Add or update tests with behaviour changes (`*.spec.ts` next to the server code, dataset tests
   in the packages, Playwright journeys for user-visible flows).
3. Run `pnpm test`, `pnpm lint`, `pnpm check-types` and `pnpm format` before pushing; CI runs them
   plus the build and the accessibility check.
4. Use Conventional Commits in the title (`feat:`, `fix:`, `data:`, `docs:`, `chore:`…).
5. Fill in the pull request template; link the issue when there is one.

Questions and ideas are welcome in the issues.
