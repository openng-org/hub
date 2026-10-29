import { LIBRARY_MAJORS } from '@openng/data-libraries';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { LibraryCheck } from '../../app/features/libraries/libraries.model';

import { checkLibrary, packageName } from './check';

describe('live package check', () => {
  it('reads the npm name out of a URL, a spec or a bare name', () => {
    expect(packageName('https://www.npmjs.com/package/@ngrx/store')).toBe('@ngrx/store');
    expect(packageName('https://www.npmjs.com/package/@ngrx/store/v/18.0.1?activeTab=code')).toBe(
      '@ngrx/store',
    );
    expect(packageName('https://npmjs.org/package/primeng')).toBe('primeng');
    expect(packageName('  npm:ngx-toastr ')).toBe('ngx-toastr');
    expect(packageName('ngx-toastr@19.0.0')).toBe('ngx-toastr');
    expect(packageName('@scope/name@1.0.0')).toBe('@scope/name');
    expect(packageName('%40ngrx%2Fstore')).toBe('@ngrx/store');
    expect(packageName('')).toBeNull();
    expect(packageName('Not A Package')).toBeNull();
    expect(packageName('https://github.com/ngrx/platform')).toBeNull();
    expect(packageName('../etc/passwd')).toBeNull();
  });

  it('answers an invalid name without asking npm', async () => {
    await expect(checkLibrary('nope nope')).resolves.toEqual({ error: 'invalid-name' });
  });
});

describe('live package check against npm and GitHub', () => {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  const registryDocument = (name: string) => ({
    description: 'A test library',
    'dist-tags': { latest: '3.0.0' },
    repository: { url: `git+https://github.com/test/${name}.git` },
    license: 'MIT',
    time: { '3.0.0': '2099-01-01T00:00:00Z' },
    versions: {
      '3.0.0': {
        version: '3.0.0',
        peerDependencies: { '@angular/core': `>=${LIBRARY_MAJORS[0]}.0.0` },
      },
    },
  });
  /** npm and GitHub as the check sees them; `down` lists the hosts that do not answer. */
  const stub = (down: string[] = [], registryStatus = 200) => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const host = new URL(url).host;
      if (down.includes(host)) throw new TypeError('fetch failed');
      if (host === 'registry.npmjs.org') {
        const name = decodeURIComponent(new URL(url).pathname.slice(1));
        return registryStatus === 200 ? json(registryDocument(name)) : json({}, registryStatus);
      }
      if (host === 'api.npmjs.org') return json({ downloads: 12_345 });
      if (url.includes('/advisories')) return json([]);
      return json({ archived: url.includes('archived-lib') });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };
  afterEach(() => vi.unstubAllGlobals());

  it('scores a package from what npm and GitHub answer, and keeps the result', async () => {
    const fetchMock = stub();
    const result = (await checkLibrary('https://www.npmjs.com/package/live-ok')) as LibraryCheck;
    expect(result.tracked).toBe(false);
    expect(result.caveats).toEqual([]);
    expect(result.detail).toMatchObject({
      name: 'live-ok',
      category: 'other',
      downloads: '12K/week',
      repository: 'https://github.com/test/live-ok',
      archived: false,
    });
    expect(result.detail.majors.every((row) => row.version === '3.0.0')).toBe(true);
    const calls = fetchMock.mock.calls.length;
    await checkLibrary('live-ok@3.0.0');
    expect(fetchMock.mock.calls.length).toBe(calls);
  });

  it('leaves out what GitHub and the downloads API could not tell', async () => {
    stub(['api.github.com', 'api.npmjs.org']);
    const result = (await checkLibrary('live-partial')) as LibraryCheck;
    expect(result.caveats).toHaveLength(3);
    expect(result.detail.downloads).toBe('unknown');
    expect(result.detail.score.reasons.map((r) => r.rule)).not.toContain('popularity');
  });

  it('reads an archived repository', async () => {
    stub();
    const result = (await checkLibrary('archived-lib')) as LibraryCheck;
    expect(result.detail.archived).toBe(true);
    expect(result.detail.score.retired).toBe('archived');
  });

  it('says when npm has no such package', async () => {
    stub([], 404);
    await expect(checkLibrary('live-missing')).resolves.toEqual({ error: 'not-found' });
  });

  it('does not keep an answer from an npm that did not answer', async () => {
    const down = stub(['registry.npmjs.org']);
    await expect(checkLibrary('live-flaky')).resolves.toEqual({ error: 'unreachable' });
    expect(down).toHaveBeenCalledTimes(1);
    stub();
    await expect(checkLibrary('live-flaky')).resolves.toMatchObject({ tracked: false });
  });
});
