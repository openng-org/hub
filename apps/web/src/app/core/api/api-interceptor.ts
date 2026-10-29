import type { HttpInterceptorFn } from '@angular/common/http';

import { API_CLIENT_HEADER, API_CLIENT_VALUE } from '../../../site';
import { isApiUrl } from './api.utils';

/**
 * Marks the browser's API requests as the web app's (`X-Hub-Client: web`): the Express server
 * refuses /api requests without it (src/server/app.ts). On the server, `ServerApiBackend` answers
 * them in-process and the header is not needed.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) =>
  next(
    isApiUrl(req.url) ? req.clone({ setHeaders: { [API_CLIENT_HEADER]: API_CLIENT_VALUE } }) : req,
  );
