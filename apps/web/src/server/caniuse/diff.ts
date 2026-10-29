import type { DiffRow } from '../../app/features/caniuse/caniuse.model';

type DiffLine = { kind: 'equal' | 'added' | 'removed'; text: string };

/** Line-level diff (longest common subsequence) of a migration's before/after example. */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.replace(/\n$/, '').split('\n');
  const b = after.replace(/\n$/, '').split('\n');
  const n = a.length;
  const m = b.length;
  // lcs[i][j] = length of the LCS of a[i..] and b[j..]
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i]![j] =
        a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }
  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ kind: 'equal', text: a[i]! });
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      result.push({ kind: 'removed', text: a[i++]! });
    } else {
      result.push({ kind: 'added', text: b[j++]! });
    }
  }
  while (i < n) result.push({ kind: 'removed', text: a[i++]! });
  while (j < m) result.push({ kind: 'added', text: b[j++]! });
  return result;
}

/** The split view: unchanged lines side by side, removed/added runs paired up. */
export function diffRows(before: string, after: string): DiffRow[] {
  const lines = diffLines(before, after);
  const rows: DiffRow[] = [];
  let k = 0;
  while (k < lines.length) {
    const line = lines[k]!;
    if (line.kind === 'equal') {
      rows.push({
        before: { text: line.text, removed: false },
        after: { text: line.text, added: false },
      });
      k++;
      continue;
    }
    const removed: string[] = [];
    const added: string[] = [];
    while (k < lines.length && lines[k]!.kind !== 'equal') {
      (lines[k]!.kind === 'removed' ? removed : added).push(lines[k]!.text);
      k++;
    }
    for (let r = 0; r < Math.max(removed.length, added.length); r++) {
      rows.push({
        before: removed[r] !== undefined ? { text: removed[r]!, removed: true } : null,
        after: added[r] !== undefined ? { text: added[r]!, added: true } : null,
      });
    }
  }
  return rows;
}
