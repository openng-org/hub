import express, { type Router } from 'express';

import { handleApi } from './api';
import { eventsCalendar, eventsRss } from './community/feeds';

/**
 * The server's own routes, without Angular: the JSON API and the feeds. `server.ts` mounts them in
 * front of the static files and server-side rendering; the HTTP specs mount them alone.
 */
export function apiRoutes(): Router {
  const router = express.Router();

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
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
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
