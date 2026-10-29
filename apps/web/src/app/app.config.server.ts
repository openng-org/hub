import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ApiTransport } from './core/api-client';
import { ServerApiTransport } from './core/api-transport.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Server side, the API is called in-process: this module (and the ~1 MB of data behind it)
    // only ever ends up in the server bundle.
    { provide: ApiTransport, useClass: ServerApiTransport },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
