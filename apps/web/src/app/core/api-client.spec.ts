import { Injectable, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClient, ApiTransport } from './api-client';

@Injectable()
class TestApi extends ApiClient {
  thing(query: Record<string, string | number | null | undefined> = {}) {
    return this.get<{ ok: boolean }>('thing', query);
  }
  mustExist() {
    return this.required(this.get<{ ok: boolean }>('missing'));
  }
}

describe('ApiClient', () => {
  const transport = { get: vi.fn<ApiTransport['get']>() };

  const setup = (platform: 'browser' | 'server') => {
    TestBed.configureTestingModule({
      providers: [
        TestApi,
        { provide: ApiTransport, useValue: transport },
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });
    return { api: TestBed.inject(TestApi), state: TestBed.inject(TransferState) };
  };

  beforeEach(() => {
    transport.get.mockReset();
    transport.get.mockImplementation(async (path) => (path === 'missing' ? null : { ok: true }));
  });

  it('makes one request per path and query, leaving defaults out of the key', async () => {
    const { api } = setup('browser');
    await Promise.all([
      api.thing(),
      api.thing({ page: 1, search: '' }),
      api.thing({ search: null, page: undefined }),
    ]);
    expect(transport.get).toHaveBeenCalledTimes(1);
    expect(transport.get.mock.calls[0]![0]).toBe('thing');
    expect(transport.get.mock.calls[0]![1].toString()).toBe('');

    await api.thing({ search: 'x', page: 2 });
    await api.thing({ page: 2, search: 'x' });
    expect(transport.get).toHaveBeenCalledTimes(2);
    expect(transport.get.mock.calls[1]![1].toString()).toBe('page=2&search=x');
  });

  it('retries after a failed request instead of caching the failure', async () => {
    const { api } = setup('browser');
    transport.get.mockRejectedValueOnce(new Error('offline'));
    await expect(api.thing()).rejects.toThrow('offline');
    await expect(api.thing()).resolves.toEqual({ ok: true });
    expect(transport.get).toHaveBeenCalledTimes(2);
  });

  it('reads what the server rendered from the transfer state in the browser', async () => {
    const { api, state } = setup('browser');
    state.set(makeStateKey<unknown>('api:thing?search=x'), { ok: false });
    await expect(api.thing({ search: 'x' })).resolves.toEqual({ ok: false });
    expect(transport.get).not.toHaveBeenCalled();
  });

  it('fills the transfer state on the server', async () => {
    const { api, state } = setup('server');
    await api.thing({ page: 3 });
    expect(state.get(makeStateKey<unknown>('api:thing?page=3'), null)).toEqual({ ok: true });
  });

  it('turns a missing required view into an error', async () => {
    const { api } = setup('browser');
    await expect(api.mustExist()).rejects.toThrow('API: unexpected empty response');
  });
});
