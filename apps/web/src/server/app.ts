import express, { type Request, type Router } from 'express';

import { API_CLIENT_HEADER, API_CLIENT_VALUE } from '../site';

import { handleApi } from './api';
import { eventsCalendar, eventsRss } from './community/feeds';

/**
 * The server's own routes, without Angular: the JSON API and the feeds. `server.ts` mounts them in
 * front of the static files and server-side rendering; the HTTP specs mount them alone.
 */
/**
 * Whether an /api request comes from the site's own pages: same origin (the browser's Fetch Metadata
 * and Origin headers, when present) and the web app's header. A cross-site page cannot send that
 * header without a CORS preflight, which this server never grants, so other sites cannot call the
 * API from their visitors' browsers. Server-side rendering does not go through HTTP at all.
 *
 * This keeps the API private to the app in practice, not in principle: anything a browser can do,
 * a script can imitate. The data itself is public in the repository.
 */
export function isAppRequest(req: Request): boolean {
  const site = req.get('sec-fetch-site');
  if (site && site !== 'same-origin') return false;
  const origin = req.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== req.get('host')) return false;
    } catch {
      return false;
    }
  }
  return req.get(API_CLIENT_HEADER) === API_CLIENT_VALUE;
}

export function apiRoutes(): Router {
  const router = express.Router();

  router.use('/api', (req, res, next) => {
    if (isAppRequest(req)) {
      next();
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(403).json({ error: 'Forbidden' });
  });

  /**
   * The API: one JSON view per endpoint (/api/caniuse/..., /api/community/...), built from the
   * workspace data packages and shaped for the UI. See src/server/.
   */
  router.use('/api', async (req, res, next) => {
    try {
      const query = new URLSearchParams(req.url.split('?')[1] ?? '');
      const data = await handleApi(req.path, query);
      if (data === null) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      // Data only changes with a deploy; date-dependent views (events) stay fresh within minutes.
      // Private: a shared cache (CDN) must not hand the answer to requests the guard would refuse.
      res.setHeader('Cache-Control', 'private, max-age=300, stale-while-revalidate=3600');
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  /** An API failure is a JSON 500, never Express's HTML page (nor its stack trace). */
  router.use('/api', ((error: unknown, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: 'Internal error' });
  }) as express.ErrorRequestHandler);

  /**
   * Feeds: the events as calendars to subscribe to (all of them, or one community's) and RSS.
   * Built per request ("upcoming" depends on the date), cached for an hour.
   */
  router.get(['/calendar/events.ics', '/calendar/:community.ics'], (req, res) => {
    const community = req.params['community'];
    const calendar = eventsCalendar(typeof community === 'string' ? community : undefined);
    if (calendar === null) {
      res.status(404).type('text/plain').send('Unknown community');
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.type('text/calendar; charset=utf-8').send(calendar);
  });
  router.get('/feed.xml', (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.type('application/rss+xml; charset=utf-8').send(eventsRss());
  });

  return router;
}
