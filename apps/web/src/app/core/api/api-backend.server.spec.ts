import { PlatformLocation } from '@angular/common';
import {
  FetchBackend,
  HttpErrorResponse,
  HttpRequest,
  HttpResponse,
  type HttpEvent,
} from '@angular/common/http';
import { REQUEST_CONTEXT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, last, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApiHandler } from '../../../server/api';
import { ServerApiBackend } from './api-backend.server';

describe('ServerApiBackend', () => {
  const handleApi = vi.fn<ApiHandler>();
  // The fetch path (other origins) is FetchBackend's own: it only has to be reached.
  const fetched = vi.spyOn(FetchBackend.prototype, 'handle');

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        ServerApiBackend,
        { provide: REQUEST_CONTEXT, useValue: { handleApi } },
        {
          provide: PlatformLocation,
          useValue: { protocol: 'https:', hostname: 'hub.test', port: '' },
        },
      ],
    });
    return TestBed.inject(ServerApiBackend);
  };
  const send = (backend: ServerApiBackend, url: string): Promise<HttpEvent<unknown>> =>
    firstValueFrom(backend.handle(new HttpRequest('GET', url)).pipe(last()));

  beforeEach(() => {
    handleApi.mockReset();
    fetched.mockReset();
    handleApi.mockImplementation(async (path) => (path === '/missing' ? null : { path }));
    fetched.mockReturnValue(of(new HttpResponse({ status: 200, body: {} })));
  });

  it('answers /api in-process, relative or made absolute against the page origin', async () => {
    const backend = setup();
    const relative = await send(backend, '/api/caniuse/features?page=2&search=x');
    expect(relative).toBeInstanceOf(HttpResponse);
    expect((relative as HttpResponse<unknown>).body).toEqual({ path: '/caniuse/features' });
    expect(handleApi.mock.calls[0]![1].toString()).toBe('page=2&search=x');

    await send(backend, 'https://hub.test/api/releases/timeline');
    expect(handleApi.mock.calls[1]![0]).toBe('/releases/timeline');
    expect(fetched).not.toHaveBeenCalled();
  });

  it('copies the view, so callers never share the server cache', async () => {
    const shared = { items: [1] };
    handleApi.mockResolvedValue(shared);
    const response = (await send(setup(), '/api/x')) as HttpResponse<typeof shared>;
    expect(response.body).toEqual(shared);
    expect(response.body).not.toBe(shared);
  });

  it('turns a missing view into a 404', async () => {
    await expect(send(setup(), '/api/missing')).rejects.toSatisfy(
      (error) => error instanceof HttpErrorResponse && error.status === 404,
    );
  });

  it('leaves other origins and paths to fetch', async () => {
    const backend = setup();
    await send(backend, 'https://elsewhere.test/api/releases/timeline');
    await send(backend, '/assets/data.json');
    expect(handleApi).not.toHaveBeenCalled();
    expect(fetched).toHaveBeenCalledTimes(2);
  });
});
