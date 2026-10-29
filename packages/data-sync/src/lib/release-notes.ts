import { decodeEntities } from './util.ts';

/** A commit listed in the notes of an angular/angular or angular/angular-cli GitHub release. */
export interface NoteCommit {
  sha: string;
  /** "feat", "fix", "perf"… */
  type: string;
  /** The "### <package>" heading the commit is listed under ("core", "@angular/build"). */
  package: string;
  /** The commit subject, without its pull request references. */
  description: string;
  repository: string;
}

/**
 * One commit row: a badge naming the type, linking to the commit, then the subject.
 *   | [![fix - 5e632b639f](https://img.shields.io/…)](https://github.com/angular/angular/commit/5e63…) | wrap `@for` … |
 */
const ROW =
  /^\|\s*\[!\[(\w+) - [0-9a-f]+\]\([^)]*\)\]\(https:\/\/github\.com\/angular\/([\w.-]+)\/commit\/([0-9a-f]{7,40})\)\s*\|\s*(.*?)\s*\|\s*$/;
const PACKAGE_HEADING = /^###\s+(.+?)\s*$/;
const SECTION_HEADING = /^#{1,2}\s/;

/** The commits of a release, in the order of its notes. */
export function parseReleaseNotes(body: string): NoteCommit[] {
  const commits: NoteCommit[] = [];
  let pkg = '';
  for (const line of body.split(/\r?\n/)) {
    const heading = PACKAGE_HEADING.exec(line);
    if (heading) {
      pkg = heading[1] ?? '';
      continue;
    }
    // "# 14.2.5", "## Breaking Changes", "## Special Thanks": no package until the next "###".
    if (SECTION_HEADING.test(line)) {
      pkg = '';
      continue;
    }
    const row = ROW.exec(line);
    if (!row) continue;
    const [, type = '', repository = '', sha = '', subject = ''] = row;
    commits.push({ sha, type, package: pkg, description: cleanSubject(subject), repository });
  }
  return commits;
}

/** "fix the thing (#123)" → "fix the thing"; table escapes and HTML entities are undone. */
export function cleanSubject(subject: string): string {
  const withoutRefs = subject.split(' (#')[0] ?? subject;
  return decodeEntities(withoutRefs.replaceAll('\\|', '|')).trim();
}
