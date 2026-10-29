/** Where the site lives: canonical URLs, Open Graph images, sitemap and feeds are absolute. */
export const SITE_URL = 'https://hub.openng.org';
export const SITE_NAME = 'Angular Hub';
/**
 * Header the web app sends with every API call; the server refuses /api requests without it (see
 * src/server/app.ts). scripts/postbuild.mjs repeats the name and value.
 */
export const API_CLIENT_HEADER = 'X-Hub-Client';
export const API_CLIENT_VALUE = 'web';
export const SITE_DESCRIPTION =
  'Community-driven data and tools for the Angular ecosystem: events, communities, podcasts, feature support per version and release insights.';
