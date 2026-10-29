import { expect, test } from './fixtures';

/** What the web app sends with every API call (src/site.ts). */
const APP = { 'X-Hub-Client': 'web' };

/** The journeys a visitor takes, on the built site. */
test.describe('journeys', () => {
  test('searching Can I Use narrows the matrix and lands in the URL', async ({ page }) => {
    await page.goto('/caniuse', { waitUntil: 'networkidle' });
    const rows = page.locator('.hub-matrix tbody tr');
    const before = await rows.count();
    expect(before).toBeGreaterThan(10);

    await page.getByRole('searchbox', { name: 'Search across all lists' }).fill('signal');
    await expect(page).toHaveURL(/[?&]search=signal/);
    await expect
      .poll(async () => rows.count(), { message: 'the rows follow the search' })
      .toBeLessThan(before);
    await expect(rows.first()).toContainText(/signal/i);

    // The search survives a reload: it is the URL, not component state.
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('searchbox', { name: 'Search across all lists' })).toHaveValue(
      'signal',
    );
  });

  test('the search palette finds content across the hub and opens it', async ({ page }) => {
    await page.goto('/events', { waitUntil: 'networkidle' });
    await page.keyboard.press('Control+k');
    const box = page.getByRole('combobox', { name: 'Search the hub' });
    await expect(box).toBeFocused();
    await box.fill('signal forms');
    const first = page.getByRole('option').first();
    await expect(first).toContainText('Signal forms');
    await expect(first).toContainText('Can I Use · Features');
    await page.keyboard.press('Enter');
    // The Can I Use list, filtered down to that feature.
    await expect(page).toHaveURL(
      /\/caniuse\?search=Signal(%20|\+)forms&package=(%40|@)angular%2Fforms$/,
    );
    await expect(page.locator('.hub-matrix tbody tr')).toHaveCount(1);
    await expect(page.locator('.hub-matrix tbody tr')).toContainText('Signal forms');
    await expect(box).toBeHidden();
  });

  test('long lists load their next pages as you scroll, without a button', async ({ page }) => {
    for (const [path, rows] of [
      ['/releases/22/commits', 'main li.hub-card-link'],
      ['/events?when=past', 'main section ol > li'],
      ['/caniuse', '.hub-matrix tbody tr'],
    ] as const) {
      await page.goto(path, { waitUntil: 'networkidle' });
      const items = page.locator(rows);
      const first = await items.count();
      expect(first, path).toBeGreaterThan(0);
      await expect(page.getByRole('button', { name: /more|older|load/i })).toHaveCount(0);
      await page.mouse.wheel(0, 20_000);
      await expect.poll(() => items.count(), { message: path }).toBeGreaterThan(first);
    }
  });

  test('the commit search finds a change across every release', async ({ page }) => {
    await page.goto('/releases/commits', { waitUntil: 'networkidle' });
    // Nothing grabs the focus on load (a prerendered select used to carry `autofocus`).
    await expect(page.locator('[autofocus]')).toHaveCount(0);

    await page.getByRole('searchbox', { name: 'Search commits' }).fill('linkedSignal');
    await expect(page).toHaveURL(/[?&]search=linkedSignal/);
    const rows = page.locator('hub-commit-list li');
    await expect(rows.first()).toContainText(/linkedSignal/i);
    const versions = await rows.getByRole('link', { name: /^Commits of Angular/ }).allInnerTexts();
    expect(new Set(versions.map((v) => v.split('.')[0])).size).toBeGreaterThan(1);

    // A release links to that release's commits in Release insights.
    await rows
      .getByRole('link', { name: /^Commits of Angular 20\./ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/releases\/20\/commits\?version=20\./);
  });

  test('library health answers "does it support Angular N?" and scores every major', async ({
    page,
  }) => {
    await page.goto('/libraries', { waitUntil: 'networkidle' });
    const cards = page.locator('main li:has(hub-health-badge)');
    expect(await cards.count()).toBeGreaterThan(5);

    // Narrowing to the latest major keeps only libraries with a version for it.
    const major = await page.getByRole('combobox', { name: 'Supports Angular version' });
    await major.click();
    await page.getByRole('option').nth(1).click();
    await expect(page).toHaveURL(/[?&]major=\d+/);
    await expect(page.getByText(/with a version for Angular \d+/)).toBeVisible();

    // A library page: the headline score and one row per major, each with its own score.
    await cards.first().locator('a').first().click();
    await expect(page).toHaveURL(/\/libraries\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page
        .locator('hub-health-badge.hub-health-badge-lg, hub-health-badge >> .hub-health-badge-lg')
        .first(),
    ).toBeVisible();
    const rows = page.locator('table tbody tr');
    expect(await rows.count()).toBeGreaterThanOrEqual(9);
    await expect(rows.first().locator('hub-health-badge')).toBeVisible();
  });

  test('the theme toggle is remembered across pages and reloads', async ({ page, hubTheme }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const html = page.locator('html');
    const startsDark = hubTheme === 'dark';
    await expect(html).toHaveClass(startsDark ? /hub-dark/ : /^((?!hub-dark).)*$/);

    await page.getByRole('button', { name: 'Dark mode' }).click();
    await expect(html).toHaveClass(startsDark ? /^((?!hub-dark).)*$/ : /hub-dark/);
    await page.goto('/podcasts', { waitUntil: 'networkidle' });
    await expect(html).toHaveClass(startsDark ? /^((?!hub-dark).)*$/ : /hub-dark/);
    expect(await page.evaluate(() => localStorage.getItem('hub-theme'))).toBe(
      startsDark ? 'light' : 'dark',
    );
  });

  test('the events page is rendered on the server, data included', async ({ request }) => {
    const [html, api] = await Promise.all([
      request.get('/events').then((response) => response.text()),
      request
        .get('/api/community/events', { headers: APP })
        .then(
          (response) => response.json() as Promise<{ months: { events: { name: string }[] }[] }>,
        ),
    ]);
    const first = api.months[0]?.events[0];
    expect(first, 'the dataset has an upcoming event').toBeDefined();
    expect(html).toContain('<hub-events-page');
    expect(html).toContain(first!.name.replace(/&/g, '&amp;'));
    // What the server fetched travels with the page, so the browser does not fetch it again.
    expect(html).toContain('ng-state');
  });

  test('an unknown page is a real 404', async ({ page, request }) => {
    const response = await request.get('/this/page/does-not-exist');
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('Page not found');

    const navigation = await page.goto('/this/page/does-not-exist');
    expect(navigation?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });

  test('the API answers the web app only, in JSON', async ({ request, page }) => {
    const outsider = await request.get('/api/caniuse/summary');
    expect(outsider.status()).toBe(403);

    // The pages themselves call it fine: a client-side navigation fetches the next view.
    const calls: number[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/api/')) calls.push(response.status());
    });
    await page.goto('/caniuse', { waitUntil: 'networkidle' });
    await page.getByRole('searchbox', { name: 'Search across all lists' }).fill('signal');
    await expect.poll(() => calls.length).toBeGreaterThan(0);
    expect(calls.every((status) => status === 200)).toBe(true);

    const summary = await request.get('/api/caniuse/summary', { headers: APP });
    expect(summary.ok()).toBe(true);
    expect(summary.headers()['content-type']).toContain('application/json');
    const missing = await request.get('/api/caniuse/features/%E0%A4%A', { headers: APP });
    expect(missing.status()).toBe(404);
    expect(await missing.json()).toEqual({ error: 'Not found' });
  });
});
