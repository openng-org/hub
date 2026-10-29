import type { MajorSupport } from './models';
import semver from 'semver';

/** The parts of a registry document (https://registry.npmjs.org/<name>) the sync and the live check read. */
export interface RegistryDocument {
  description?: string;
  'dist-tags'?: { latest?: string };
  versions?: Record<string, RegistryVersion>;
  /** ISO timestamp per version, plus `created` and `modified`. */
  time?: Record<string, string>;
  repository?: string | { url?: string };
  license?: string | { type?: string } | { type?: string }[];
}

export interface RegistryVersion {
  version: string;
  description?: string;
  peerDependencies?: Record<string, string>;
  deprecated?: string | boolean;
  repository?: string | { url?: string };
  license?: string | { type?: string } | { type?: string }[];
}

/** What a registry document says about a library, before the data that changes every week. */
export interface RegistryFacts {
  description: string | null;
  repository: string | null;
  license: string | null;
  latest: string;
  latestReleased: string;
  deprecated: string | null;
  /** Per major, the version to use (without its vulnerabilities, known later). */
  majors: Record<string, Omit<MajorSupport, 'vulnerabilities'> | null>;
}

/**
 * The peer dependencies that tell which Angular a version targets, most telling first: a library
 * declares one on core, or on the package it builds on.
 */
const ANGULAR_PEERS = [
  '@angular/core',
  '@angular/common',
  '@angular/compiler-cli',
  '@angular/router',
  '@angular/forms',
  '@angular/platform-browser',
  '@angular/cdk',
  '@angular/material',
  '@angular/build',
  '@angular-devkit/build-angular',
  '@angular/cli',
];

/** The Angular peer range of a version, null when it declares none. */
export function angularPeerRange(version: RegistryVersion): string | null {
  const peers = version.peerDependencies ?? {};
  for (const name of ANGULAR_PEERS) {
    const range = peers[name];
    if (range && semver.validRange(range)) return range;
  }
  return null;
}

/** Whether an Angular peer range accepts some release of a major. */
export function acceptsMajor(range: string, major: number): boolean {
  return semver.intersects(range, `^${major}.0.0`, { includePrerelease: true });
}

/**
 * Reads a registry document; null when it has no latest version (an unpublished package). The
 * version for a major is the newest stable one whose Angular peer range accepts it, and never one
 * older than the version for the major before.
 */
export function registryFacts(doc: RegistryDocument, majors: number[]): RegistryFacts | null {
  const latest = doc['dist-tags']?.latest;
  const latestVersion = latest ? doc.versions?.[latest] : undefined;
  if (!latest || !latestVersion) return null;

  const stable = Object.values(doc.versions ?? {})
    .filter((entry) => semver.valid(entry.version) && !semver.prerelease(entry.version))
    .sort((a, b) => semver.rcompare(a.version, b.version))
    .map((entry) => ({ entry, range: angularPeerRange(entry) }))
    .filter((item): item is { entry: RegistryVersion; range: string } => item.range !== null);
  const support: RegistryFacts['majors'] = {};
  // A library whose latest version declares no Angular peer at all (msal-angular, say) cannot be
  // placed by ranges: its latest version stands for every major, flagged by a null peer.
  if (angularPeerRange(latestVersion) === null) {
    for (const major of majors) {
      support[String(major)] = { version: latest, peer: null, released: day(doc.time?.[latest]) };
    }
    return facts(doc, latestVersion, latest, support);
  }
  // Packages have thousands of versions but a few distinct ranges: each range is checked once.
  const accepted = new Map<string, boolean>();
  const accepts = (range: string, major: number) => {
    const key = `${major} ${range}`;
    if (!accepted.has(key)) accepted.set(key, acceptsMajor(range, major));
    return accepted.get(key)!;
  };
  let floor: string | null = null;
  for (const major of [...majors].sort((a, b) => a - b)) {
    const found = stable.find(({ range }) => accepts(range, major));
    // Older than the version for the major before: an open range of an old release, not support
    // (nobody downgrades from 21.1.2 to 2.0.0 to move to Angular 22).
    const current: { entry: RegistryVersion; range: string } | null =
      found && (!floor || semver.gte(found.entry.version, floor)) ? found : null;
    support[String(major)] = current
      ? {
          version: current.entry.version,
          peer: current.range,
          released: day(doc.time?.[current.entry.version]),
        }
      : null;
    if (current) floor = current.entry.version;
  }
  return facts(doc, latestVersion, latest, support);
}

function facts(
  doc: RegistryDocument,
  latestVersion: RegistryVersion,
  latest: string,
  majors: RegistryFacts['majors'],
): RegistryFacts {
  const deprecated = latestVersion.deprecated;
  return {
    description: plainText(latestVersion.description) || plainText(doc.description) || null,
    repository: repositoryUrl(latestVersion.repository ?? doc.repository),
    license: licenseName(latestVersion.license ?? doc.license),
    latest,
    latestReleased: day(doc.time?.[latest]),
    deprecated:
      typeof deprecated === 'string' ? plainText(deprecated) : deprecated ? 'Deprecated' : null,
    majors,
  };
}

/**
 * A description as one line of text: some packages put their README's HTML there, which npm cuts
 * mid-tag; a leftover tag opening is dropped with everything after it. Markdown badges go too.
 */
export function plainText(value: string | undefined): string {
  return (
    (value ?? '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/<.*$/, '')
      // Markdown badges and links: "[![Build](img)](url)" goes, "[text](url)" keeps its text.
      .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300)
  );
}

function day(timestamp: string | undefined): string {
  return timestamp?.slice(0, 10) ?? '';
}

/** "git+ssh://git@github.com/owner/repo.git" → "https://github.com/owner/repo"; null when not GitHub. */
export function repositoryUrl(repository: RegistryDocument['repository']): string | null {
  const raw = typeof repository === 'string' ? repository : repository?.url;
  const match = /github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/#?].*)?$/.exec(raw ?? '');
  return match ? `https://github.com/${match[1]}/${match[2]}` : null;
}

export function licenseName(license: RegistryDocument['license']): string | null {
  if (!license) return null;
  if (typeof license === 'string') return license;
  if (Array.isArray(license)) return licenseName(license[0]);
  return license.type ?? null;
}
