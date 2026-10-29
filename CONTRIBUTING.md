# Contributing to Angular Hub

## Why this project exists

Angular Hub was born from a personal vision: the tools I wished I had, shared publicly. It is meant to
keep that mindset, sharing knowledge in a genuine way.

This means some good contributions may be declined because they do not fit that mindset. That does
not make them useless to the community: they may be better published as projects of their own.

## Welcome

Thanks for helping. Angular Hub is community-driven data about the Angular ecosystem (events,
communities, podcasts, feature support, releases, library health) and the site that shows it, hub.openng.org. Most
contributions are data: a missing meetup, a wrong date, a new podcast. Code contributions are
welcome too.

This project follows the [OpenNG Code of Conduct](https://github.com/openng-org/.github/blob/main/CODE_OF_CONDUCT.md)
and the general [OpenNG contributing guide](https://github.com/openng-org/.github/blob/main/CONTRIBUTING.md)
(Conventional Commits, small focused pull requests), with one difference about features, below.
Security issues go through [SECURITY.md](SECURITY.md), never through public issues.

## Feature pull requests and AI

We used to encourage contributors to open an issue to discuss an idea before implementing it. The
main goal was to avoid wasting anyone's time on work that would not be merged. Nowadays, AI agents
can prototype an idea quite easily, so that cost is much lower.

Pull requests for features are welcome directly, no issue needed first. Just keep in mind that they
can still be declined at the end (see [Why this project exists](#why-this-project-exists)).

## Built for the product, not for engineering perfection

From day one, this project has relied heavily on AI to generate its code, to focus on delivering
features rather than on perfect engineering and architecture.

This means it can be improved in many ways, but pure refactoring contributions may wait: they are
not the project's top priority, nor mine, as I maintain many other projects.

## Contributing data

### From the site (no setup needed)

The [Add to the hub](https://hub.openng.org/contribute) page builds the entry for an event, a
community or a podcast, checks it with the dataset's own rules, and opens GitHub's new-file page
with `packages/data-community/data/inbox/<file>.json` filled in. Committing it there proposes the
pull request, fork included. CI validates inbox files; a maintainer merges them into the datasets
with `pnpm --filter @openng/data-community merge-inbox` before merging the pull request.

### By hand

Datasets are JSON files (and three curated TypeScript lists) under `packages/*`:

| Data                                       | File                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------- |
| Events                                     | `packages/data-community/data/events.json`                           |
| Communities (organizers)                   | `packages/data-community/data/organizers.json`                       |
| Podcasts                                   | `packages/data-community/data/podcasts.json`                         |
| Coordinates of on-site locations           | `packages/data-community/data/places.json` (`[lat, lng]`)            |
| Logos of communities and podcasts          | `apps/web/public/logos/<id>.webp` (or `.svg`), ~256 px, no padding   |
| Can I Use: curated feature statuses        | `packages/data-caniuse/src/caniuse.ts`                               |
| Can I Use: angular-eslint rules            | `packages/data-caniuse/src/eslint/data.ts`                           |
| Can I Use: ng update migration examples    | `packages/data-caniuse/data/angular-migrations-extended.json`        |
| Can I Use: replacements of deprecated APIs | `packages/data-caniuse/data/deprecated-replacements.json`            |
| Can I Use: Angular MCP server catalog      | `packages/data-caniuse/src/mcp/data.ts`                              |
| Releases (announcements), migration guides | `packages/data-releases/data/releases.json`, `src/migration-guides/` |
| Library health: the tracked libraries      | `packages/data-libraries/data/libraries.json` (npm name, category)   |

Angular's majors, support windows and compatibility ranges, GitHub releases, commits, deprecated
APIs and ng update migrations are generated from Angular's repositories, and the libraries' health
data (`health.json`) from npm and the GitHub Advisory Database (`pnpm data:sync`, see the README).
They are refreshed every week: do not edit those files by hand.

Rules that matter:

- Every dataset has a `vitest` suite (`pnpm test`) that validates it: ids are unique, dates are ISO
  days, URLs are https, statuses are known, an event's organizer exists, an on-site event has a
  location with coordinates in `places.json`, and so on. Run it before opening the pull request;
  CI runs it too. The rules the site's form applies are in `packages/data-community/src/validate.ts`.
- Events: one entry per edition. A recurring meetup without a specific title can leave `name`
  empty, the site then shows the organizer's name. Use `callForPapersUrl`/`callForPapersDueDate`
  when speakers are wanted. Prices are a starting price plus an ISO 4217 `currency`; free events set
  `isFree: true`.
- Libraries: add the npm name and a category to `libraries.json` (the categories are the
  `LibraryCategory` type in `packages/data-libraries/src/models.ts`); the next weekly sync fills in
  its health data (or run `pnpm data:sync libraries`). [Check it live](https://hub.openng.org/libraries/check)
  first to see what the hub will show. Official `@angular/*` packages are not tracked (they follow
  Angular's own version). The score's rules are in `packages/data-libraries/HEALTH_SCORE.md`;
  changing them is a feature pull request like any other (see
  [Feature pull requests and AI](#feature-pull-requests-and-ai)).
- Communities and podcasts need a logo: a square `.webp` (or `.svg`) named after the entry's id.
- Can I Use features follow the Angular versions in `packages/core-angular-versions`: list a status
  for every major from the first one that matters, in ascending order, with the commit or
  documentation link when you have it.
- New Angular major: nothing to declare, the weekly data sync adds it everywhere on its release
  day. Then fill in its announcement and video in `packages/data-releases/data/releases.json`, and
  give the Can I Use features their status in the new major.

Data is published under CC BY 4.0 ([LICENSE-DATA](LICENSE-DATA)); by contributing data you agree
to that licence. Logos stay the property of their owners (see [ATTRIBUTION.md](ATTRIBUTION.md)).

## Contributing code

### Prerequisites

- Node.js 22 LTS (22.22.3 or later; `.nvmrc` has the major) or 24.15+ (`engines` in
  `package.json`).
- pnpm, through corepack: `corepack enable` picks the version pinned in `package.json`
  (`packageManager`, pnpm 11).
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

Environment variables, all optional: `GITHUB_TOKEN` (in a git-ignored `.env` at the root, copied
from `.env.example`: raises GitHub's limit from 60 to 5,000 requests an hour for `pnpm data:sync` and
for the live package check of the built server), `PORT` (the built server, default 4000),
`POSTBUILD_PORT` (the build's own server while it draws OG images, default 4500) and
`E2E_PORT`/`E2E_URL` (the Playwright checks start their own server on 4400 unless a URL is given).
Never commit a token.

### How the code is organised

Read the "How the pieces fit" section of the [README](README.md) first. In short:

- `packages/*` are framework-free TypeScript consumed from source; avoid runtime dependencies (see
  the README for why). When one is unavoidable, declare it in `apps/web/package.json` too, and list
  any new workspace package in `prebundle.exclude` (`apps/web/angular.json`), or `pnpm dev` breaks
  while the build still passes. Shared helpers go to `@openng/core-angular-versions`.
- The server (`apps/web/src/server/<area>/`) turns the datasets into UI-ready views; the UI reads
  them with `httpResource(() => apiUrl(...))`. New data never reaches the browser bundle: add a
  server view and its types in `apps/web/src/app/features/<area>/<area>.model.ts` instead.
- `apps/web/src/app` follows the [Angular folder structure guide](https://www.angular.courses/blog/angular-folder-structure-guide):
  `core/` for what is not business (layout, API plumbing, search, theme, SEO, about and 404 pages),
  `shared/` for presentational code any feature can use (generic inputs, no business logic), and
  `features/<area>/` with routed components under `pages/`, the area's components under
  `components/`, and its model and route resolvers at the root. File names follow the Angular style
  guide: no `.component`/`.service` suffix, `-pipe`/`-guard` style for the rest, dot notation for
  `.model.ts`, `.routes.ts` and `.utils.ts`, specs next to their file.
- The UI uses Optimus UI and Tailwind only. Import Optimus components and directives themselves
  (`Select`, `Tag`, `InputText`…), not their NgModules: those only re-export them (`TreeTableModule`
  is the exception, its pieces are not standalone).
- Modern Angular throughout (standalone, signals, `input()`,
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
