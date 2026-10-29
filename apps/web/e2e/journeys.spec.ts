import { expect, test } from './fixtures';

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

  test('a feature row opens its drawer', async ({ page }) => {
    await page.goto('/caniuse', { waitUntil: 'networkidle' });
    const row = page.locator('.hub-matrix tbody tr').first();
    const name = (await row.locator('td').first().innerText()).trim();
    await row.click();
    // Optimus' drawer is a complementary landmark (role="complementary").
    const drawer = page
      .getByRole('complementary')
      .filter({ has: page.getByRole('button', { name: 'Close' }) });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('heading', { level: 2 })).toContainText(name.split('\n')[0]!);
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
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
        .get('/api/community/events')
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

  test('the API answers JSON and refuses unknown paths', async ({ request }) => {
    const summary = await request.get('/api/caniuse/summary');
    expect(summary.ok()).toBe(true);
    expect(summary.headers()['content-type']).toContain('application/json');
    const missing = await request.get('/api/caniuse/features/%E0%A4%A');
    expect(missing.status()).toBe(404);
    expect(await missing.json()).toEqual({ error: 'Not found' });
  });
});
