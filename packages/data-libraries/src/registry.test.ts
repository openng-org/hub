import { describe, expect, it } from 'vitest';

import {
  acceptsMajor,
  angularPeerRange,
  licenseName,
  plainText,
  registryFacts,
  repositoryUrl,
  type RegistryDocument,
  type RegistryVersion,
} from './registry';

const version = (
  v: string,
  core: string | null,
  extra: Partial<RegistryVersion> = {},
): RegistryVersion => ({
  version: v,
  peerDependencies: core ? { '@angular/core': core } : {},
  ...extra,
});

const DOC: RegistryDocument = {
  description: 'Root description',
  'dist-tags': { latest: '20.1.0' },
  versions: {
    '2.0.0': version('2.0.0', '>=13.0.0'),
    '18.0.0': version('18.0.0', '^18.0.0'),
    '19.0.0': version('19.0.0', '>=19.0.0'),
    '19.1.0-next.0': version('19.1.0-next.0', '^19.0.0 || ^20.0.0'),
    '20.0.0': version('20.0.0', '^20.0.0', { description: 'Latest description' }),
    '20.1.0': version('20.1.0', '^20.0.0', {
      description: 'Latest description',
      repository: { url: 'git+https://github.com/owner/repo.git' },
      license: 'MIT',
      deprecated: 'Use other-lib',
    }),
  },
  time: {
    '2.0.0': '2021-01-01T00:00:00Z',
    '18.0.0': '2024-05-01T00:00:00Z',
    '19.0.0': '2024-11-30T10:00:00Z',
    '20.1.0': '2025-07-01T00:00:00Z',
  },
};

describe('registryFacts', () => {
  it('picks the newest stable version accepting each major, open ranges included', () => {
    const facts = registryFacts(DOC, [17, 18, 19, 20, 21])!;
    expect(facts).toMatchObject({
      description: 'Latest description',
      repository: 'https://github.com/owner/repo',
      license: 'MIT',
      latest: '20.1.0',
      latestReleased: '2025-07-01',
      deprecated: 'Use other-lib',
    });
    expect(facts.majors).toEqual({
      // 2.0.0's ">=13.0.0" accepts 17, and it is the only one to: the version for 17.
      '17': { version: '2.0.0', peer: '>=13.0.0', released: '2021-01-01' },
      '18': { version: '18.0.0', peer: '^18.0.0', released: '2024-05-01' },
      '19': { version: '19.0.0', peer: '>=19.0.0', released: '2024-11-30' },
      '20': { version: '20.1.0', peer: '^20.0.0', released: '2025-07-01' },
      // 19.0.0's ">=19.0.0" accepts 21, but it is older than the version for 20; the pre-release
      // is never recommended.
      '21': null,
    });
  });

  it('never recommends a version older than the one for the major before', () => {
    const facts = registryFacts(
      {
        'dist-tags': { latest: '21.1.2' },
        versions: {
          '2.0.0': version('2.0.0', '>=13.0.0'),
          '21.1.2': version('21.1.2', '^21.0.0'),
        },
      },
      [20, 21, 22],
    )!;
    expect(facts.majors['20']?.version).toBe('2.0.0');
    expect(facts.majors['21']?.version).toBe('21.1.2');
    // 2.0.0 accepts 22 by its open range, but going back to it is not support.
    expect(facts.majors['22']).toBeNull();
  });

  it('uses the latest version for every major when no Angular peer is declared', () => {
    const facts = registryFacts(
      {
        'dist-tags': { latest: '6.2.5' },
        versions: {
          '1.1.1': version('1.1.1', '>= 6.0.0'),
          '6.2.5': {
            version: '6.2.5',
            peerDependencies: { rxjs: '^7.4.0' },
            description: '<div align="center"><h1>Hi</h1></div>  there',
          },
        },
        time: { '6.2.5': '2026-10-01T00:00:00Z' },
      },
      [21, 22],
    )!;
    expect(facts.majors).toEqual({
      '21': { version: '6.2.5', peer: null, released: '2026-10-01' },
      '22': { version: '6.2.5', peer: null, released: '2026-10-01' },
    });
    expect(facts.description).toBe('Hi there');
    expect(plainText('ngx-toastr <a href="https://www.npmjs.org/package/')).toBe('ngx-toastr');
    expect(
      plainText('[![Build](https://x/badge.svg)](https://x) Scroll, see [docs](https://d).'),
    ).toBe('Scroll, see docs.');
  });

  it('answers null for a package without a latest version', () => {
    expect(registryFacts({}, [20])).toBeNull();
    expect(registryFacts({ 'dist-tags': { latest: '1.0.0' }, versions: {} }, [20])).toBeNull();
  });

  it('reads the Angular peer from the packages a library builds on', () => {
    expect(
      angularPeerRange({ version: '1.0.0', peerDependencies: { '@angular/cdk': '^21.0.0' } }),
    ).toBe('^21.0.0');
    expect(angularPeerRange({ version: '1.0.0', peerDependencies: { react: '^19' } })).toBeNull();
    expect(
      angularPeerRange({ version: '1.0.0', peerDependencies: { '@angular/core': 'not a range' } }),
    ).toBeNull();
    expect(acceptsMajor('^20.1.0', 20)).toBe(true);
    expect(acceptsMajor('>=19.0.0 <21', 21)).toBe(false);
    expect(acceptsMajor('^22.0.0-next.0', 22)).toBe(true);
  });

  it('cleans repository urls and licenses', () => {
    expect(repositoryUrl('git@github.com:ngrx/platform.git')).toBe(
      'https://github.com/ngrx/platform',
    );
    expect(
      repositoryUrl({ url: 'https://github.com/primefaces/primeng/tree/master/packages' }),
    ).toBe('https://github.com/primefaces/primeng');
    expect(repositoryUrl('https://gitlab.com/x/y')).toBeNull();
    expect(repositoryUrl(undefined)).toBeNull();
    expect(licenseName([{ type: 'Apache-2.0' }])).toBe('Apache-2.0');
    expect(licenseName({ type: 'MIT' })).toBe('MIT');
    expect(licenseName(undefined)).toBeNull();
  });
});
