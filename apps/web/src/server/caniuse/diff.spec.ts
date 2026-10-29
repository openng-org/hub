import { describe, expect, it } from 'vitest';

import { diffRows } from './diff';

describe('diffRows', () => {
  it('keeps unchanged lines side by side and pairs removed/added runs', () => {
    expect(diffRows('a\nb\nc\n', 'a\nB\nc\nd')).toEqual([
      { before: { text: 'a', removed: false }, after: { text: 'a', added: false } },
      { before: { text: 'b', removed: true }, after: { text: 'B', added: true } },
      { before: { text: 'c', removed: false }, after: { text: 'c', added: false } },
      { before: null, after: { text: 'd', added: true } },
    ]);
  });
});
