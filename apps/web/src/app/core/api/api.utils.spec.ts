import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { apiUrl, isApiUrl, notFoundAsNull } from './api.utils';

describe('api utils', () => {
  it('builds one URL per view: sorted parameters, defaults left out', () => {
    expect(apiUrl('releases/timeline')).toBe('/api/releases/timeline');
    expect(apiUrl('caniuse/features', { page: 1, search: '', status: null, type: undefined })).toBe(
      '/api/caniuse/features',
    );
    expect(apiUrl('caniuse/features', { search: 'x y', page: 2 })).toBe(
      '/api/caniuse/features?page=2&search=x+y',
    );
    expect(apiUrl('x', { b: '2', a: 1 })).toBe(apiUrl('x', { a: 1, b: '2' }));
    expect(isApiUrl('/api/releases/timeline')).toBe(true);
    expect(isApiUrl('/apiary')).toBe(false);
  });

  it('turns a 404 into null for resolvers, and lets other errors through', async () => {
    const notFound = new HttpErrorResponse({ status: 404 });
    await expect(firstValueFrom(throwError(() => notFound).pipe(notFoundAsNull()))).resolves.toBe(
      null,
    );
    await expect(firstValueFrom(of(1).pipe(notFoundAsNull()))).resolves.toBe(1);
    const failure = new HttpErrorResponse({ status: 500 });
    await expect(firstValueFrom(throwError(() => failure).pipe(notFoundAsNull()))).rejects.toBe(
      failure,
    );
  });
});
