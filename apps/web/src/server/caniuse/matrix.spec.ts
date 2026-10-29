import { describe, expect, it } from 'vitest';

import { latestStatus, matrixCells } from './matrix';

describe('matrixCells', () => {
  const majors = ['22', '21', '20', '19'];

  it('gives one cell per major: statuses within it, oldest first, minors flagged', () => {
    const cells = matrixCells(
      [
        { version: 20, status: 'experimental' },
        { version: 21.1, status: 'preview' },
        { version: 21, status: 'experimental' },
        { version: 19, status: null },
      ],
      majors,
    );
    expect(cells.map((c) => c.kind)).toEqual(['upcoming', 'statuses', 'statuses', 'none']);
    const cell21 = cells[1]!;
    expect(cell21.kind === 'statuses' && cell21.glyphs).toEqual([
      { status: 'experimental', version: '21', minor: false, label: 'Experimental in version 21' },
      { status: 'preview', version: '21.1', minor: true, label: 'Preview in version 21.1' },
    ]);
  });

  it('reports the newest status with its version label', () => {
    expect(
      latestStatus([
        { version: 21.2, status: 'stable' },
        { version: 22, status: null },
        { version: 20, status: 'experimental' },
      ]),
    ).toEqual({ status: 'stable', version: '21.2' });
    expect(latestStatus([{ version: 22, status: null }])).toBeNull();
  });
});
