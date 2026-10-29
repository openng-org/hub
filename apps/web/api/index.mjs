/**
 * Vercel function: every request that is not a static file (see vercel.json) reaches the Express
 * app built by `ng build` — the API (/api/...) and server-side rendering. Prerendered pages and
 * assets are served from dist/web/browser by Vercel's CDN before the rewrite applies.
 */
const server = await import(new URL('../dist/web/server/server.mjs', import.meta.url).href);

export default server.reqHandler;
