import { describe, expect, it } from 'vitest';

import { dateRange, relative, tile } from './dates';

describe('dates', () => {
  it('formats single days and ranges', () => {
    expect(dateRange('2026-11-12')).toBe('Thu 12 Nov 2026');
    expect(dateRange('2026-11-12', '2026-11-14')).toBe('12 – 14 Nov 2026');
    expect(dateRange('2026-11-30', '2026-12-02')).toBe('30 Nov – 2 Dec 2026');
    expect(dateRange('2026-12-31', '2027-01-01')).toBe('31 Dec 2026 – 1 Jan 2027');
  });

  it('builds the calendar tile', () => {
    expect(tile('2026-11-12')).toEqual({ month: 'NOV', day: '12', weekday: 'THU' });
  });

  it('says how far an event is', () => {
    const today = '2026-10-28';
    expect(relative(today, '2026-10-28')).toBe('Today');
    expect(relative(today, '2026-10-29')).toBe('Tomorrow');
    expect(relative(today, '2026-11-05')).toBe('In 8 days');
    expect(relative(today, '2026-11-25')).toBe('In 4 weeks');
    expect(relative(today, '2026-10-27', '2026-10-29')).toBe('Happening now');
    expect(relative(today, '2024-10-28')).toBe('2 years ago');
  });
});
