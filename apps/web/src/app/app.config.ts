import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';
import { provideOptimus } from '@openng/optimus-ui/config';

import { routes } from './app.routes';
import { HubPreset } from './theme';
import { ApiTransport } from './core/api-client';
import { BrowserApiTransport } from './core/api-transport.browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // Child routes (the release sections) receive their parent's params and resolved data as inputs.
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideOptimus({
      theme: {
        preset: HubPreset,
        options: {
          // Tailwind's `dark:` variant and Optimus both follow the .hub-dark class on <html> (see
          // index.html and core/theme.ts).
          darkModeSelector: '.hub-dark',
          cssLayer: { name: 'optimus', order: 'theme, base, optimus' },
        },
      },
    }),
    // The browser calls the API over HTTP (/api/...), or reads what SSR already fetched from the
    // transfer state; app.config.server.ts swaps in the in-process transport.
    { provide: ApiTransport, useClass: BrowserApiTransport },
  ],
};
