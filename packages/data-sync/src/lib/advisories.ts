import type { Vulnerability, VulnerabilitySeverity } from '@openng/data-libraries';
import semver from 'semver';

/** A record of the GitHub Advisory Database (GET /advisories), the parts the sync reads. */
export interface GithubAdvisory {
  ghsa_id: string;
  summary: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'unknown';
  html_url: string;
  withdrawn_at: string | null;
  vulnerabilities: {
    package: { ecosystem: string; name: string } | null;
    /** GitHub's syntax: ">= 1.0.0, < 1.2.3" (a comma is an "and"). */
    vulnerable_version_range: string | null;
  }[];
}

/** Whether a version falls in a vulnerable range as GitHub writes it. */
export function inVulnerableRange(version: string, range: string | null): boolean {
  if (!range) return false;
  const converted = range.replaceAll(',', ' ').replace(/([<>=]+)\s+/g, '$1');
  return semver.validRange(converted) !== null && semver.satisfies(version, converted);
}

/**
 * The advisories affecting each "name@version" asked, as the dataset stores them. A withdrawn
 * advisory, or one GitHub could not rate, is left out.
 */
export function affectedVersions(
  versions: { name: string; version: string }[],
  advisories: GithubAdvisory[],
): Map<string, Vulnerability[]> {
  const found = new Map<string, Vulnerability[]>();
  for (const advisory of advisories) {
    const severity = severityOf(advisory);
    if (advisory.withdrawn_at || !severity) continue;
    for (const { name, version } of versions) {
      const affected = advisory.vulnerabilities.some(
        (v) =>
          v.package?.ecosystem === 'npm' &&
          v.package.name === name &&
          inVulnerableRange(version, v.vulnerable_version_range),
      );
      if (!affected) continue;
      const key = `${name}@${version}`;
      const list = found.get(key) ?? [];
      if (list.some((v) => v.id === advisory.ghsa_id)) continue;
      list.push({
        id: advisory.ghsa_id,
        severity,
        summary: advisory.summary.trim(),
        url: advisory.html_url,
      });
      found.set(key, list);
    }
  }
  for (const list of found.values()) list.sort((a, b) => a.id.localeCompare(b.id));
  return found;
}

function severityOf(advisory: GithubAdvisory): VulnerabilitySeverity | null {
  switch (advisory.severity) {
    case 'medium':
      return 'moderate';
    case 'unknown':
      return null;
    default:
      return advisory.severity;
  }
}
