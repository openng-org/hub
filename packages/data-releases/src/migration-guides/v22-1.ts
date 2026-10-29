import type { MigrationGuide } from './migration-guide.model';

const NG = 'https://github.com/angular/angular';
const CLI = 'https://github.com/angular/angular-cli';

export const migrationGuide22_1: MigrationGuide = {
  version: '22.1',
  majorVersion: 22,
  from: '22.0',
  releaseDate: '2026-07-29',
  summary:
    'Angular 22.1 ships no breaking changes, but it tightens several security defaults (XSRF, Meta tags, SSR), deprecates JSONP and changes how the SSR transfer cache and prerendering behave. Most apps can update in minutes; review the high-criticality items first.',
  updateCommand: 'ng update @angular/core@22.1 @angular/cli@22.1',
  changes: [
    {
      id: 'xsrf-root-http-client',
      title: 'XSRF protection is now enabled for the root-provided HttpClient',
      summary:
        'Previously, injecting HttpClient without calling provideHttpClient() left the XSRF interceptor out of the chain. It is now included by default, so mutating requests carry the X-XSRF-TOKEN header read from the XSRF-TOKEN cookie.',
      kind: 'behavior-change',
      difficulty: 'easy',
      criticality: 'high',
      impact: 'security',
      introducedIn: '22.1.0',
      packages: ['@angular/common/http'],
      affects:
        'Apps injecting HttpClient without an explicit provideHttpClient() call, especially if the backend uses custom XSRF cookie/header names or strict CORS header allow-lists.',
      steps: [
        'Search your bootstrap config for `provideHttpClient(`. If it is missing, your app relied on the root-provided HttpClient and is affected.',
        "If your backend uses non-default names, declare them explicitly: `provideHttpClient(withXsrfConfiguration({ cookieName: '…', headerName: '…' }))`.",
        'If a proxy or backend rejects unknown headers, allow `X-XSRF-TOKEN` (or your custom header) on mutating endpoints.',
        'Only if you have a deliberate reason, opt out with `provideHttpClient(withNoXsrfProtection())` and document why.',
        'Smoke-test POST/PUT/PATCH/DELETE calls after the update.',
      ],
      before: {
        language: 'ts',
        code: `// app.config.ts — no HTTP provider, XSRF interceptor was NOT applied
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};`,
      },
      after: {
        language: 'ts',
        code: `// app.config.ts — explicit and self-documenting
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: "XSRF-TOKEN",
        headerName: "X-XSRF-TOKEN",
      }),
    ),
  ],
};`,
      },
      links: [
        {
          label: 'Commit',
          url: `${NG}/commit/ec16a3d6c6785992197bc0ae81afb1e699232f64`,
        },
        {
          label: 'HttpClient security guide',
          url: 'https://angular.dev/best-practices/security#httpclient-xsrf-csrf-security',
        },
      ],
    },
    {
      id: 'security-patches-22-1-x',
      title: 'Stay on the latest 22.1.x patch: security hardening',
      summary:
        'The 22.1 patch line contains a series of hardening fixes: host binding sanitization, TransferState prototype-pollution protection, SSR origin validation, public directory containment in CommonEngine, oversized fetch body cancellation and MCP roots enforcement in the CLI.',
      kind: 'security-fix',
      difficulty: 'trivial',
      criticality: 'high',
      impact: 'security',
      introducedIn: '22.1.0',
      packages: [
        '@angular/core',
        '@angular/common/http',
        '@angular/platform-server',
        '@angular/ssr',
        '@angular/cli',
      ],
      affects:
        'Every app, and SSR apps in particular (TransferState, origin validation, asset path resolution).',
      steps: [
        'Update to the latest 22.1.x patch rather than stopping at 22.1.0 (the update command above resolves the latest 22.1 patch).',
        'Keep @angular/core, @angular/ssr and @angular/cli on matching patch lines.',
        'For SSR apps, re-check that your server only serves files from the intended public directory and that the configured allowed hosts/origins are correct.',
        'Enable automated dependency updates (Renovate/Dependabot) for `@angular/*` patch releases.',
      ],
      command: 'ng update @angular/core@22.1 @angular/cli@22.1',
      links: [
        {
          label: 'TransferState prototype pollution fix',
          url: `${NG}/commit/168a324cce0f133ed92953374c2510a75868b790`,
        },
        {
          label: 'Host binding sanitization fix',
          url: `${NG}/commit/6afe6fa781c2f0931f0aedd729b9884a8fe212ee`,
        },
        {
          label: 'SSR origin validation hardening',
          url: `${NG}/pull/69184`,
        },
      ],
    },
    {
      id: 'prerender-failures-fail-build',
      title: 'Prerendering failures now fail the build',
      summary:
        'When a route fails to prerender, the build now fails and the route is excluded, instead of silently producing a broken or missing page.',
      kind: 'behavior-change',
      difficulty: 'moderate',
      criticality: 'high',
      impact: 'build',
      introducedIn: '22.1.7',
      packages: ['@angular/build'],
      affects:
        "SSR/SSG apps using prerendering (RenderMode.Prerender or outputMode: 'static'), especially in CI.",
      steps: [
        'Run a production build locally (`ng build`) before merging the update.',
        'For every route reported as failing, reproduce with `ng serve` and fix the root cause (missing data at build time, browser-only APIs, failing HTTP calls).',
        'Guard browser-only code with `afterNextRender()` or `isPlatformBrowser()`.',
        'If a route cannot be prerendered, switch it to `RenderMode.Server` or `RenderMode.Client` in your server routes config instead of letting it fail.',
      ],
      after: {
        language: 'ts',
        code: `// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  { path: "dashboard/**", renderMode: RenderMode.Client },
  { path: "products/:id", renderMode: RenderMode.Server },
  { path: "**", renderMode: RenderMode.Prerender },
];`,
      },
      links: [
        { label: 'Angular CLI releases', url: `${CLI}/releases/tag/v22.1.7` },
        {
          label: 'Hybrid rendering guide',
          url: 'https://angular.dev/guide/ssr',
        },
      ],
    },
    {
      id: 'meta-event-handler-attributes',
      title: 'Meta service rejects event handler attributes',
      summary:
        'Meta.addTag(), addTags() and updateTag() now throw a RuntimeError (NG05203) when an attribute starting with `on` is passed, to prevent XSS through meta elements.',
      kind: 'behavior-change',
      difficulty: 'trivial',
      criticality: 'medium',
      impact: 'security',
      introducedIn: '22.1.3',
      packages: ['@angular/platform-browser'],
      affects:
        'Code building meta tags from dynamic objects (CMS content, API responses, spread of untrusted data).',
      steps: [
        'Search for `addTag(`, `addTags(` and `updateTag(` usages.',
        'Make sure no `on*` attribute (onload, onclick…) can reach these calls, especially when the tag definition comes from external data.',
        'Whitelist allowed keys (name, property, content, charset…) when mapping CMS data to MetaDefinition.',
      ],
      before: {
        language: 'ts',
        code: `// Forwards whatever the CMS returns
this.meta.addTag({ ...cmsTag });`,
      },
      after: {
        language: 'ts',
        code: `const { name, property, content } = cmsTag;
this.meta.addTag({ name, property, content });`,
      },
      links: [
        {
          label: 'Commit',
          url: `${NG}/commit/6f9a6bea50944fff894eb5629075b13f8c3090d7`,
        },
      ],
    },
    {
      id: 'transfer-cache-credentials',
      title: 'SSR transfer cache skips credentialed and non-cacheable requests',
      summary:
        'The HTTP transfer cache no longer stores requests sent with credentials, responses with Set-Cookie, or responses whose Cache-Control forbids caching. Two new options let you opt back in explicitly.',
      kind: 'behavior-change',
      difficulty: 'easy',
      criticality: 'medium',
      impact: 'ssr',
      introducedIn: '22.1.0',
      packages: ['@angular/common/http', '@angular/platform-browser'],
      affects:
        'SSR apps with hydration that call authenticated APIs (withCredentials, cookies) or APIs returning Cache-Control: no-store/private.',
      steps: [
        'After updating, load an SSR page with DevTools open: requests that were served from TransferState and are now repeated on the client are affected.',
        'Decide per case: duplicate requests are safer when the HTML may be cached by a CDN or shared between users.',
        'If the rendered HTML is never shared, opt back in with `withHttpTransferCacheOptions({ includeRequestsWithCredentials: true })` and/or `includeNonCacheableRequests: true`.',
        "Prefer fixing the API's Cache-Control headers over enabling `includeNonCacheableRequests` globally.",
      ],
      after: {
        language: 'ts',
        code: `provideClientHydration(
  withHttpTransferCacheOptions({
    includeRequestsWithCredentials: true,
    includeNonCacheableRequests: false,
  }),
);`,
      },
      links: [
        {
          label: 'Commit',
          url: `${NG}/commit/e3630c23`,
        },
        { label: 'Fix PR', url: `${NG}/pull/69017` },
      ],
    },
    {
      id: 'http-interceptors-parent-chain',
      title: 'Root interceptors always run with withRequestsMadeViaParent()',
      summary:
        'Root interceptors now consistently run at the end of the chain for child HttpClient configurations. Combining withRequestsMadeViaParent() and withFetch() in the same provideHttpClient() call now throws a configuration error.',
      kind: 'behavior-change',
      difficulty: 'easy',
      criticality: 'medium',
      impact: 'reliability',
      introducedIn: '22.1.1',
      packages: ['@angular/common/http'],
      affects:
        'Apps providing HttpClient again in lazy routes or components with withRequestsMadeViaParent().',
      steps: [
        'Search for `withRequestsMadeViaParent(`.',
        'Remove `withFetch()` from those child provideHttpClient() calls: the fetch backend is inherited from the parent.',
        'Check that interceptors are not applied twice (e.g. auth headers or logging): order is now child → parent → root for requests.',
      ],
      before: {
        language: 'ts',
        code: `// lazy route providers
provideHttpClient(withRequestsMadeViaParent(), withFetch())`,
      },
      after: {
        language: 'ts',
        code: `// withFetch() stays in the root config only
provideHttpClient(
  withRequestsMadeViaParent(),
  withInterceptors([featureInterceptor]),
)`,
      },
      links: [
        {
          label: 'Commit',
          url: `${NG}/commit/caf616670fd20d528aa69e0131cc17d60f0cc27d`,
        },
      ],
    },
    {
      id: 'jsonp-deprecated',
      title: 'JSONP support is deprecated',
      summary:
        'HttpClient.jsonp(), HttpClientJsonpModule, withJsonpSupport() and the related JSONP classes are deprecated and will be removed in a future major. Use regular HTTP requests with CORS instead.',
      kind: 'deprecation',
      difficulty: 'moderate',
      criticality: 'medium',
      impact: 'maintenance',
      introducedIn: '22.1.0',
      packages: ['@angular/common/http'],
      affects: 'Apps calling third-party or legacy endpoints through JSONP.',
      steps: [
        'Search for `jsonp(`, `withJsonpSupport` and `HttpClientJsonpModule`.',
        'Check whether the endpoint supports CORS; if it does, switch to `http.get()`.',
        "If it doesn't, ask the API owner for CORS support or proxy the call through your own backend (or the SSR server).",
        'Remove `withJsonpSupport()` / `HttpClientJsonpModule` once no JSONP call remains.',
      ],
      before: {
        language: 'ts',
        code: `provideHttpClient(withJsonpSupport());

this.http.jsonp<Weather>(url, "callback");`,
      },
      after: {
        language: 'ts',
        code: `provideHttpClient();

this.http.get<Weather>(url); // endpoint must send CORS headers`,
      },
      links: [
        {
          label: 'Angular 22.1.0 release notes',
          url: `${NG}/releases/tag/v22.1.0`,
        },
      ],
    },
    {
      id: 'devkit-file-buffer-deprecated',
      title: 'stringToFileBuffer / fileBufferToString are deprecated',
      summary:
        'The @angular-devkit/core buffer helpers are deprecated in favor of the standard TextEncoder / TextDecoder Web APIs.',
      kind: 'deprecation',
      difficulty: 'trivial',
      criticality: 'low',
      impact: 'maintenance',
      introducedIn: '22.1.0',
      packages: ['@angular-devkit/core'],
      affects:
        'Authors of custom schematics, builders or Nx/CLI plugins. Regular apps are not affected.',
      steps: [
        'Search for `stringToFileBuffer` and `fileBufferToString`.',
        'Replace them with `new TextEncoder().encode()` and `new TextDecoder().decode()`.',
      ],
      before: {
        language: 'ts',
        code: `import { fileBufferToString, stringToFileBuffer } from "@angular-devkit/core";

const text = fileBufferToString(buffer);
const buffer = stringToFileBuffer(text);`,
      },
      after: {
        language: 'ts',
        code: `const text = new TextDecoder().decode(buffer);
const buffer = new TextEncoder().encode(text);`,
      },
      links: [{ label: 'Commit', url: `${CLI}/commit/fd336d36` }],
    },
    {
      id: 'injectable-to-service-migration',
      title: 'Optional: migrate @Injectable to @Service',
      summary:
        "A new schematic converts `@Injectable({ providedIn: 'root' })` classes to the `@Service()` decorator. It is optional and can be run folder by folder.",
      kind: 'new-feature',
      difficulty: 'easy',
      criticality: 'low',
      impact: 'devx',
      introducedIn: '22.1.0',
      packages: ['@angular/core'],
      affects: 'Codebases wanting to align with the modern service authoring style.',
      steps: [
        'Commit your work, then run the schematic on the whole app or a sub-path (`--path src/app/feature`).',
        "Review classes the schematic skipped: constructor injection, extra @Injectable options or providedIn other than 'root'.",
        'Convert constructor injection to `inject()` first if you want those classes migrated too.',
        'Run your tests and lint.',
      ],
      command: 'ng generate @angular/core:service',
      before: {
        language: 'ts',
        code: `@Injectable({ providedIn: "root" })
export class CartStore {
  private readonly http = inject(HttpClient);
}`,
      },
      after: {
        language: 'ts',
        code: `@Service()
export class CartStore {
  private readonly http = inject(HttpClient);
}`,
      },
      links: [{ label: 'Commit', url: `${NG}/commit/c75ff025` }],
    },
    {
      id: 'linked-signal-custom-set',
      title: 'Optional: custom set on linkedSignal',
      summary:
        'linkedSignal accepts a `set` option called by set() and update(). It lets a derived signal write back to its source, replacing effect-based synchronization.',
      kind: 'new-feature',
      difficulty: 'easy',
      criticality: 'low',
      impact: 'devx',
      introducedIn: '22.1.0',
      packages: ['@angular/core'],
      affects:
        'Code syncing two signals with effect() or manual writes (unit conversions, editing a property of a parent object).',
      steps: [
        'Look for `effect()` calls whose only job is to write a signal derived from another one.',
        'Replace them with a linkedSignal whose `set` option updates the source signal.',
        "Use the second `rawSet` argument if you also need to update the linkedSignal's own value.",
      ],
      before: {
        language: 'ts',
        code: `const order = signal<Order>(initialOrder);
const shipping = signal(order().shippingMethod);

effect(() => {
  const method = shipping();
  order.update((o) => ({ ...o, shippingMethod: method }));
});`,
      },
      after: {
        language: 'ts',
        code: `const order = signal<Order>(initialOrder);
const shipping = linkedSignal(() => order().shippingMethod, {
  set: (method) =>
    order.update((o) => ({ ...o, shippingMethod: method })),
});`,
      },
      links: [{ label: 'Commit', url: `${NG}/commit/124ba10e` }],
    },
    {
      id: 'css-var-namespacing',
      title: 'Optional: CSS variable namespacing for multi-app pages',
      summary:
        'An opt-in compiler feature prefixes CSS custom properties declared in component styles with an app namespace, so several Angular apps (micro-frontends) can share a page without leaking variables. Global stylesheets are not namespaced.',
      kind: 'new-feature',
      difficulty: 'moderate',
      criticality: 'low',
      impact: 'devx',
      introducedIn: '22.1.0',
      packages: ['@angular/core', '@angular/compiler'],
      affects: 'Micro-frontend setups or widgets embedded next to other Angular apps.',
      steps: [
        'Enable it with `provideCssVarNamespacing()` in app.config.ts, using a namespace that matches your APP_ID plus a separator (e.g. `my-app_`).',
        'Prefix variables that must stay shared across apps with `--global--` (e.g. `--global--brand-color`). Names like `--global-foo` are rejected by the compiler.',
        "Replace JavaScript reads/writes of CSS variables (`style.setProperty('--x', …)`) with the `CssVarNamespacer` service so names are namespaced consistently.",
        'Verify theming: variables defined in global styles.css are not namespaced, only component styles are.',
      ],
      links: [{ label: 'Pull request', url: `${NG}/pull/68846` }],
    },
    {
      id: 'build-cache-and-chunks',
      title: 'Build: shared cache across worktrees and server chunk optimization',
      summary:
        'The persistent build cache is now shared across git worktrees with an SQLite store fallback, server builds get chunk optimization (Rolldown by default), and debug IDs make SRI hashes stable.',
      kind: 'new-feature',
      difficulty: 'trivial',
      criticality: 'low',
      impact: 'performance',
      introducedIn: '22.1.0',
      packages: ['@angular/build'],
      affects: 'Every app using the application builder; no code change required.',
      steps: [
        'Nothing to change: run `ng build` and compare bundle budgets and server output with 22.0.',
        'If you use several git worktrees, expect faster cold builds from the shared cache.',
        'Report regressions in server bundles to the Angular CLI repository.',
      ],
      links: [{ label: 'Angular CLI 22.1.0 release', url: `${CLI}/releases/tag/v22.1.0` }],
    },
  ],
};
