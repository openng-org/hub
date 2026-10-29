import express from 'express';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { API_CLIENT_HEADER, API_CLIENT_VALUE } from '../site';
import { apiRoutes } from './app';

/** What the web app sends with every API call. */
const APP = { headers: { [API_CLIENT_HEADER]: API_CLIENT_VALUE } };

/** The API and the feeds over HTTP, on a random port, as Express serves them. */
describe('server routes', () => {
  const app = express().use(apiRoutes());
  let server: ReturnType<typeof app.listen>;
  let base: string;

  beforeAll(async () => {
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it('serves a view as JSON with a cache header', async () => {
    const response = await fetch(`${base}/api/caniuse/summary`, APP);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/application\/json/);
    expect(response.headers.get('cache-control')).toBe(
      'private, max-age=300, stale-while-revalidate=3600',
    );
    const summary = (await response.json()) as { counts: { features: number } };
    expect(summary.counts.features).toBeGreaterThan(0);
  });

  it('refuses API calls that do not come from the web app', async () => {
    const refused: [string, RequestInit][] = [
      ['no app header', {}],
      ['wrong app header', { headers: { [API_CLIENT_HEADER]: 'curl' } }],
      ['cross-site fetch', { headers: { ...APP.headers, 'Sec-Fetch-Site': 'cross-site' } }],
      ['same-site subdomain', { headers: { ...APP.headers, 'Sec-Fetch-Site': 'same-site' } }],
      ['foreign origin', { headers: { ...APP.headers, Origin: 'https://evil.example' } }],
      ['broken origin', { headers: { ...APP.headers, Origin: 'not a url' } }],
    ];
    for (const [label, init] of refused) {
      const response = await fetch(`${base}/api/caniuse/summary`, init);
      expect(response.status, label).toBe(403);
      expect(response.headers.get('cache-control'), label).toBe('no-store');
      expect(await response.json(), label).toEqual({ error: 'Forbidden' });
    }
    // The site's own pages: same origin, as browsers report it.
    const host = new URL(base).host;
    const sameOrigin = await fetch(`${base}/api/caniuse/summary`, {
      headers: { ...APP.headers, 'Sec-Fetch-Site': 'same-origin', Origin: `http://${host}` },
    });
    expect(sameOrigin.status).toBe(200);
  });

  it('answers 404 as JSON for unknown paths and broken encodings, never 500', async () => {
    for (const path of [
      '/api/nope',
      '/api/caniuse/features/does-not-exist',
      '/api/caniuse/features/%E0%A4%A',
    ]) {
      const response = await fetch(`${base}${path}`, APP);
      expect(response.status, path).toBe(404);
      expect(await response.json()).toEqual({ error: 'Not found' });
    }
  });

  it('clamps page numbers instead of failing', async () => {
    for (const page of ['0', '-3', '9999', 'abc']) {
      const response = await fetch(`${base}/api/caniuse/features?page=${page}`, APP);
      expect(response.status, page).toBe(200);
      const list = (await response.json()) as { page: number; pageCount: number; items: unknown[] };
      expect(list.page).toBeGreaterThanOrEqual(1);
      expect(list.page).toBeLessThanOrEqual(list.pageCount);
      expect(list.items.length).toBeGreaterThan(0);
    }
  });

  it('keeps the feeds public: calendar apps and feed readers send no app header', async () => {
    const all = await fetch(`${base}/calendar/events.ics`);
    expect(all.status).toBe(200);
    expect(all.headers.get('content-type')).toBe('text/calendar; charset=utf-8');
    expect(all.headers.get('cache-control')).toBe(
      'public, max-age=3600, stale-while-revalidate=86400',
    );
    expect((await all.text()).startsWith('BEGIN:VCALENDAR')).toBe(true);

    const one = await fetch(`${base}/calendar/angular-athens.ics`);
    expect(one.status).toBe(200);
    expect(await one.text()).toContain('X-WR-CALNAME:Angular Athens');

    const unknown = await fetch(`${base}/calendar/nope.ics`);
    expect(unknown.status).toBe(404);

    const rss = await fetch(`${base}/feed.xml`);
    expect(rss.status).toBe(200);
    expect(rss.headers.get('content-type')).toBe('application/rss+xml; charset=utf-8');
    expect(await rss.text()).toContain('<rss version="2.0"');
  });
});
