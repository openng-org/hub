import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Data-driven pages are prerendered at build time from the workspace packages; a data change is a
 * PR, a merge is a rebuild. Pages whose content depends on the date render per request; search and
 * filters are served by the API at runtime (src/server.ts); unknown URLs, and known routes with an
 * id that does not exist, render the 404 page with a 404 status (NotFoundPage sets it).
 *
 * The server views that list the pages to prerender are imported on demand: they are only needed
 * at build time, and the running server gets the API from Express (api-transport.server.ts), so the
 * datasets are not bundled a second time into the app.
 */
const caniuse = () => import('../server/caniuse/index');
const releases = () => import('../server/releases/index');
const libraries = () => import('../server/libraries/index');

export const serverRoutes: ServerRoute[] = [
  // The release timeline's support statuses and "you are here" marker depend on today's date.
  { path: '', renderMode: RenderMode.Server },
  // "Upcoming" depends on today's date: rendered per request, never frozen at build time.
  { path: 'events', renderMode: RenderMode.Server },
  { path: 'communities', renderMode: RenderMode.Server },
  { path: 'podcasts', renderMode: RenderMode.Prerender },
  { path: 'contribute', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  // The tabs are pages of their own, so a deep link gets the right one from the CDN.
  { path: 'caniuse', renderMode: RenderMode.Prerender },
  { path: 'caniuse/update', renderMode: RenderMode.Prerender },
  { path: 'caniuse/mcp', renderMode: RenderMode.Prerender },
  { path: 'caniuse/eslint', renderMode: RenderMode.Prerender },
  {
    path: 'caniuse/update/:version',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const { migrationMajors } = await caniuse();
      return migrationMajors().map((version) => ({ version: String(version) }));
    },
  },
  {
    path: 'caniuse/update/migrations/:repository/:name',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const { migrationRefs } = await caniuse();
      return migrationRefs().map(({ repository, name }) => ({ repository, name }));
    },
  },
  { path: 'libraries', renderMode: RenderMode.Prerender },
  { path: 'libraries/score', renderMode: RenderMode.Prerender },
  {
    path: 'libraries/:name',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const { libraryRefs } = await libraries();
      return libraryRefs().flatMap(({ path }) => (path.length === 2 ? [{ name: path[1]! }] : []));
    },
  },
  {
    path: 'libraries/:scope/:name',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const { libraryRefs } = await libraries();
      return libraryRefs().flatMap(({ path }) =>
        path.length === 3 ? [{ scope: path[1]!, name: path[2]! }] : [],
      );
    },
  },
  { path: 'releases', renderMode: RenderMode.Server },
  // The first page of every release's commits is prerendered; the filters run on the API.
  { path: 'releases/commits', renderMode: RenderMode.Prerender },
  {
    path: 'releases/:version',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const { RELEASE_MAJORS } = await releases();
      return RELEASE_MAJORS.map((version) => ({ version: String(version) }));
    },
  },
  // TODO(migration-guide): hidden for now (see HIDDEN_SECTIONS in server/releases/index.ts): rendered
  // on request, kept out of the sitemap. Remove this route when the guide comes back.
  { path: 'releases/:version/guide', renderMode: RenderMode.Server },
  {
    path: 'releases/:version/:section',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const { RELEASE_MAJORS, RELEASE_SECTION_IDS } = await releases();
      return RELEASE_MAJORS.flatMap((version) =>
        RELEASE_SECTION_IDS.filter((id) => id !== 'overview').map((section) => ({
          version: String(version),
          section,
        })),
      );
    },
  },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
