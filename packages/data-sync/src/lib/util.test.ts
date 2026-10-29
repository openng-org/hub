import { describe, expect, it } from 'vitest';

import { decodeEntities, mapLimit } from './util.ts';

describe('decodeEntities', () => {
  it('decodes in one pass', () => {
    expect(decodeEntities('can&apos;t &lt;div&gt; &quot;a&quot; &#39;b&#39;')).toBe(
      `can't <div> "a" 'b'`,
    );
    expect(decodeEntities('preserve &amp;ngsp; and &nbsp;')).toBe('preserve &ngsp; and &nbsp;');
  });
});

describe('mapLimit', () => {
  it('keeps the order and never runs more than the limit at once', async () => {
    let running = 0;
    let peak = 0;
    const results = await mapLimit([30, 10, 20, 5], 2, async (ms) => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, ms));
      running--;
      return ms * 2;
    });
    expect(results).toEqual([60, 20, 40, 10]);
    expect(peak).toBe(2);
    expect(await mapLimit([], 4, async () => 1)).toEqual([]);
  });
});
