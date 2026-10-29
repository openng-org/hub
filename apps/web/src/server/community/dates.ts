/** Calendar helpers on plain ISO days ("2026-11-12"), always in UTC so no timezone shifts a day. */

/** Short month names, as every label on the site writes them. */
export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 86_400_000;

/** Today as an ISO day (UTC). */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function parts(iso: string): { year: number; month: number; day: number; weekday: number } {
  const date = new Date(`${iso}T00:00:00Z`);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    weekday: date.getUTCDay(),
  };
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

/** The calendar tile: "NOV", "12", "THU". */
export function tile(iso: string): { month: string; day: string; weekday: string } {
  const { month, day, weekday } = parts(iso);
  return {
    month: MONTHS[month]!.toUpperCase(),
    day: String(day),
    weekday: WEEKDAYS[weekday]!.toUpperCase(),
  };
}

/** "Thu 12 Nov 2026", or a range: "12 – 14 Nov 2026", "30 Nov – 2 Dec 2026". */
export function dateRange(start: string, end?: string): string {
  const a = parts(start);
  if (!end || end === start) return `${WEEKDAYS[a.weekday]} ${a.day} ${MONTHS[a.month]} ${a.year}`;
  const b = parts(end);
  if (a.year !== b.year) {
    return `${a.day} ${MONTHS[a.month]} ${a.year} – ${b.day} ${MONTHS[b.month]} ${b.year}`;
  }
  if (a.month !== b.month)
    return `${a.day} ${MONTHS[a.month]} – ${b.day} ${MONTHS[b.month]} ${b.year}`;
  return `${a.day} – ${b.day} ${MONTHS[a.month]} ${a.year}`;
}

/** "12 Nov", for deadlines. */
export function shortDate(iso: string): string {
  const { day, month } = parts(iso);
  return `${day} ${MONTHS[month]}`;
}

/** "12 Nov 2026". */
export function longDate(iso: string): string {
  const { day, month, year } = parts(iso.slice(0, 10));
  return `${day} ${MONTHS[month]} ${year}`;
}

/** "November 2026" and its sort key "2026-11". */
export function monthOf(iso: string): { key: string; label: string } {
  const { year, month } = parts(iso);
  return { key: iso.slice(0, 7), label: `${MONTH_NAMES[month]} ${year}` };
}

/** "Jan 2025" from "2025-01". */
export function monthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  return `${MONTHS[(month ?? 1) - 1]} ${year}`;
}

/** "Today", "Tomorrow", "In 12 days", "In 3 weeks", "Yesterday", "3 weeks ago", "2 years ago". */
export function relative(today: string, start: string, end?: string): string {
  if (end && start <= today && today <= end) return 'Happening now';
  const days = daysBetween(today, start);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  const abs = Math.abs(days);
  const [count, unit] =
    abs < 14
      ? [abs, 'day']
      : abs < 60
        ? [Math.round(abs / 7), 'week']
        : abs < 365
          ? [Math.round(abs / 30), 'month']
          : [Math.round(abs / 365), 'year'];
  const span = `${count} ${unit}${count === 1 ? '' : 's'}`;
  return days > 0 ? `In ${span}` : `${span} ago`;
}
