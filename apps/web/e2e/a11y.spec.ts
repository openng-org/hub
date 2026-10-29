import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

/**
 * Accessibility (axe-core, WCAG 2.x A/AA incl. colour contrast) on a page of every kind, plus the
 * states only reachable by interacting (open menu, form errors). Each project runs
 * it in its colour scheme.
 */
// Playwright runs these specs as CommonJS (the package is not "type": "module"), hence `require`.
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const AXE_OPTIONS = { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] };

/** One page of every kind (static, server-rendered, filtered, detail, 404). */
const PAGES = [
  '/',
  '/events',
  '/events?when=past',
  '/events?view=map&when=past',
  '/events?view=map&when=past&region=europe',
  '/communities',
  '/podcasts',
  '/contribute',
  '/contribute?kind=community',
  '/contribute?kind=podcast',
  '/about',
  '/caniuse',
  '/caniuse/update',
  '/caniuse/mcp',
  '/caniuse/eslint',
  '/caniuse/update/22',
  '/releases/22',
  '/releases/22/features',
  '/releases/22/guide',
  '/releases/22/update',
  '/releases/22/commits',
  '/libraries',
  '/libraries/score',
  '/libraries/check',
  '/libraries/check?package=nope-nope-zzz-123',
  '/releases/commits',
  '/releases/commits?search=zzzqqq',
  '/releases/21/mcp',
  '/releases/21/eslint',
  '/releases/22/changelogs',
  '/does-not-exist',
];

/** States only reachable by interacting. */
const INTERACTIONS: [path: string, label: string, act: (page: Page) => Promise<void>][] = [
  [
    '/contribute',
    'form errors shown',
    (page) => page.getByRole('button', { name: 'Open the pull request' }).click(),
  ],
  [
    '/events',
    'search palette with results',
    async (page) => {
      await page.getByRole('button', { name: 'Search the hub' }).click();
      await page.getByRole('combobox', { name: 'Search the hub' }).fill('signal');
      await page.getByRole('option').first().waitFor();
    },
  ],
  [
    '/caniuse',
    'Releases menu open',
    (page) => page.getByRole('menuitem', { name: 'Releases' }).click(),
  ],
];

interface AxeNode {
  html: string;
  target: string[];
  failureSummary: string;
  any: { data?: Record<string, string> }[];
}
interface AxeViolation {
  id: string;
  nodes: AxeNode[];
}

/**
 * Known issues in third-party markup, skipped until fixed upstream — keep each one narrow.
 * - Optimus MegaMenu puts aria-level on its role="menuitem" items, which ARIA does not allow
 *   there (it belongs to treeitem/heading/row). Report it to openng-org/optimus-ui.
 */
const KNOWN_UPSTREAM: ((violation: AxeViolation, node: AxeNode) => boolean)[] = [
  (violation, node) =>
    violation.id === 'aria-allowed-attr' &&
    node.html.includes('p-megamenu-item') &&
    /aria-level/.test(node.failureSummary) &&
    !/aria-(?!level)[a-z]+="/.test(node.failureSummary.replace(/aria-level="\d+"/g, '')),
];

async function audit(page: Page): Promise<string[]> {
  await page.addScriptTag({ content: AXE });
  const violations = await page.evaluate((options) => {
    type Axe = {
      run: (context: Document, options: unknown) => Promise<{ violations: AxeViolation[] }>;
    };
    return (window as unknown as { axe: Axe }).axe
      .run(document, options)
      .then((result) => result.violations);
  }, AXE_OPTIONS);
  return violations.flatMap((violation) =>
    violation.nodes
      .filter((node) => !KNOWN_UPSTREAM.some((known) => known(violation, node)))
      .map((node) => {
        const data = node.any[0]?.data;
        const contrast = data?.['contrastRatio']
          ? ` (${data['fgColor']} on ${data['bgColor']}: ${data['contrastRatio']}, needs ${data['expectedContrastRatio']})`
          : '';
        return `${violation.id}${contrast}\n    ${node.target.join(' ')}\n    ${node.html.slice(0, 140)}`;
      }),
  );
}

test.describe('accessibility', () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(await audit(page)).toEqual([]);
    });
  }
  for (const [path, label, act] of INTERACTIONS) {
    test(`${path} — ${label}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await act(page);
      await page.waitForTimeout(600);
      expect(await audit(page)).toEqual([]);
    });
  }
});
