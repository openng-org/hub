import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

import { apiUrl, notFoundAsNull } from '../../core/api/api.utils';
import type { LibraryDetail } from './libraries.model';

/** /libraries/:name and /libraries/:scope/:name — the library, or null when the hub does not track it. */
export const libraryResolver: ResolveFn<LibraryDetail | null> = (route: ActivatedRouteSnapshot) => {
  const scope = route.paramMap.get('scope');
  const name = route.paramMap.get('name') ?? '';
  return inject(HttpClient)
    .get<LibraryDetail>(apiUrl(`libraries/${scope ? `${scope}/${name}` : name}`))
    .pipe(notFoundAsNull());
};
