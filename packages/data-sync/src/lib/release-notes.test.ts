import { describe, expect, it } from 'vitest';

import { cleanSubject, parseReleaseNotes } from './release-notes.ts';

const badge = (type: string, repo: string, sha: string) =>
  `[![${type} - ${sha.slice(0, 10)}](https://img.shields.io/badge/${sha.slice(0, 10)}-${type}-green)](https://github.com/angular/${repo}/commit/${sha})`;

const NOTES = `<a name="22.1.7"></a>
# 22.1.7 (2026-10-01)
## Breaking Changes
### core
- Something changed, without a table.
### compiler
| Commit | Description |
| -- | -- |
| ${badge('fix', 'angular', '5e632b639f736de876823a596dd9e3a094b03e1b')} | wrap \`@for\` collection expression |
### core
| Commit | Description |
| -- | -- |
| ${badge('feat', 'angular', 'ec48c8305c40fbafbab51801f93bb4e4b6a25ea0')} | can&apos;t fail (#61234) |
| ${badge('perf', 'angular', 'abcdef1234')} | a \\| b |
## Special Thanks
Someone`;

describe('parseReleaseNotes', () => {
  it('lists the commits of the tables, under their package heading', () => {
    expect(parseReleaseNotes(NOTES)).toEqual([
      {
        sha: '5e632b639f736de876823a596dd9e3a094b03e1b',
        type: 'fix',
        package: 'compiler',
        description: 'wrap `@for` collection expression',
        repository: 'angular',
      },
      {
        sha: 'ec48c8305c40fbafbab51801f93bb4e4b6a25ea0',
        type: 'feat',
        package: 'core',
        description: "can't fail",
        repository: 'angular',
      },
      {
        sha: 'abcdef1234',
        type: 'perf',
        package: 'core',
        description: 'a | b',
        repository: 'angular',
      },
    ]);
  });

  it('has no package for a table outside a package section', () => {
    const notes = `# 14.2.5\n| ${badge('fix', 'angular-cli', '17eb20c77098841d45f0444f5f047c4d44fc614f')} | x |`;
    expect(parseReleaseNotes(notes)[0]).toMatchObject({ package: '', repository: 'angular-cli' });
    expect(parseReleaseNotes('')).toEqual([]);
  });

  it('cleans subjects', () => {
    expect(cleanSubject(' fix it (#1) (#2) ')).toBe('fix it');
    expect(cleanSubject('preserve &amp;ngsp;')).toBe('preserve &ngsp;');
  });
});
