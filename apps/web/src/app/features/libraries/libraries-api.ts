import { inject, Injectable } from '@angular/core';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

import { ApiClient } from '../../core/api/api-client';
import type { LibraryDetail, LibraryList, LibraryQuery } from './libraries.model';

/** Library health as the UI sees it (see api.ts). */
@Injectable({ providedIn: 'root' })
export class LibrariesApi extends ApiClient {
  libraries(query: LibraryQuery): Promise<LibraryList> {
    return this.required(this.get<LibraryList>('libraries', { ...query }));
  }

  /** A library by npm name ("@ngrx/store"); null when the hub does not track it. */
  library(name: string): Promise<LibraryDetail | null> {
    return this.get<LibraryDetail>(`libraries/${name}`);
  }
}

/** /libraries/:name and /libraries/:scope/:name — the library, or null when unknown. */
export const libraryResolver: ResolveFn<LibraryDetail | null> = (route: ActivatedRouteSnapshot) => {
  const scope = route.paramMap.get('scope');
  const name = route.paramMap.get('name') ?? '';
  return inject(LibrariesApi).library(scope ? `${scope}/${name}` : name);
};
