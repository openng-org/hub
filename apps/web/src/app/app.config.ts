import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
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
import { HubPreset } from './core/theme/aura-preset';
import { apiInterceptor } from './core/api/api-interceptor';

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
    // The HTTP transfer cache (on by default) hands what SSR fetched to hydration.
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
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
  ],
};
