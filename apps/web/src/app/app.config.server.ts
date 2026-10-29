import { HttpBackend } from '@angular/common/http';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ServerApiBackend } from './core/api/api-backend.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // Server side, /api requests are answered in-process: this module (and the ~1 MB of data
    // behind it) only ever ends up in the server bundle.
    ServerApiBackend,
    { provide: HttpBackend, useExisting: ServerApiBackend },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
