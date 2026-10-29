import { describe, expect, it } from 'vitest';

import { compatibilityRows, markdownTables, mergeMajors, supportedMajors } from './angular-docs.ts';

const RELEASES = `### Actively supported versions

The following table provides the status for Angular versions under support.

| Version | Status | Released   | Active ends | LTS ends   |
| :------ | :----- | :--------- | :---------- | :--------- |
| ^22.0.0 | Active | 2026-06-03 | 2027-06     | 2028-06    |
| ^21.0.0 | LTS    | 2025-11-19 | 2026-06-03  | 2027-06    |
| ^23.0.0 | Upcoming | TBD      | TBD         | TBD        |

IMPORTANT: Angular versions v2 to v20 are no longer supported.`;

const VERSIONS = `## Actively supported versions

| Angular                        | Node.js                             | TypeScript     | RxJS               |
| ------------------------------ | ----------------------------------- | -------------- | ------------------ |
| 22.0.x                         | ^22.22.3 \\|\\| ^24.15.0 | >=6.0.0 <6.1.0 | ^6.5.3 \\|\\| ^7.4.0 |

### Before v9

| Angular  | Angular CLI      | Node.js | TypeScript     | RxJS   |
| -------- | ---------------- | ------- | -------------- | ------ |
| 8.2.x    | 8.2.x \\|\\| 8.3.x | ^10.9.0 | >=3.4.2 <3.6.0 | ^6.4.0 |
| 2.x      | -                | ^6.9.0  | >=1.8.0 <2.2.0 | ^5.0.1 |

| Angular | Baseline Date | Browser Set |
| ------- | ------------- | ----------- |
| v22     | 2026-05-07    | [Set][v22]  |`;

describe('angular.dev reference pages', () => {
  it('splits markdown tables, escaped pipes kept in their cell', () => {
    const [table] = markdownTables('text\n| a | b \\| c |\n| - | - |\n| 1 | 2 |\nafter');
    expect(table).toEqual({ header: ['a', 'b | c'], rows: [['1', '2']] });
  });

  it('reads the supported majors, skipping rows without dates', () => {
    expect(supportedMajors(RELEASES)).toEqual([
      { major: 22, released: '2026-06-03', activeEnds: '2027-06', ltsEnds: '2028-06' },
      { major: 21, released: '2025-11-19', activeEnds: '2026-06-03', ltsEnds: '2027-06' },
    ]);
    expect(supportedMajors('no table')).toEqual([]);
  });

  it('reads every compatibility table, and only those', () => {
    expect(compatibilityRows(VERSIONS)).toEqual([
      {
        angular: '22.0.x',
        node: '^22.22.3 || ^24.15.0',
        typescript: '>=6.0.0 <6.1.0',
        rxjs: '^6.5.3 || ^7.4.0',
      },
      {
        angular: '8.2.x',
        angularCli: '8.2.x || 8.3.x',
        node: '^10.9.0',
        typescript: '>=3.4.2 <3.6.0',
        rxjs: '^6.4.0',
      },
      { angular: '2.x', node: '^6.9.0', typescript: '>=1.8.0 <2.2.0', rxjs: '^5.0.1' },
    ]);
  });

  it('merges the known majors with the supported and newly released ones, not the upcoming', () => {
    const merged = mergeMajors(
      [
        { major: 21, released: '2025-11-19', activeEnds: '2026-05', ltsEnds: '2027-05' },
        { major: 20, released: '2025-05-28', activeEnds: '2025-11-19', ltsEnds: '2026-11-28' },
      ],
      [
        { major: 23, released: '2026-11-18', activeEnds: '2027-05', ltsEnds: '2028-05' },
        { major: 21, released: '2025-11-19', activeEnds: '2026-06-03', ltsEnds: '2027-06' },
      ],
      [
        { major: 22, released: '2026-06-03' },
        { major: 21, released: '2025-11-20' },
      ],
      '2026-11-02',
    );
    expect(merged).toEqual([
      { major: 22, released: '2026-06-03' },
      { major: 21, released: '2025-11-19', activeEnds: '2026-06-03', ltsEnds: '2027-06' },
      { major: 20, released: '2025-05-28', activeEnds: '2025-11-19', ltsEnds: '2026-11-28' },
    ]);
  });
});
