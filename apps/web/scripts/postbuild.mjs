/**
 * After `ng build`: writes what search engines and link previews read, next to the prerendered
 * pages in dist/web/browser:
 *
 * - sitemap.xml: every prerendered route plus the server-rendered ones, and robots.txt;
 * - og/**.png: a 1200×630 Open Graph image per page kind, Can I Use feature and Angular release,
 *   in the hub's pixel style (rendered with resvg; fonts and logo in scripts/og/).
 *
 * The data comes from the API of the built server, started here on a spare port.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist/web');
const BROWSER = join(DIST, 'browser');
const OG = join(ROOT, 'scripts/og');
// The same value as src/site.ts (this script runs outside the TypeScript build).
const SITE_URL = 'https://hub.openng.org';
const PORT = Number(process.env.POSTBUILD_PORT ?? 4500);
const API = `http://localhost:${PORT}/api`;

/** Rendered per request (date-dependent), so missing from the prerender list. */
const SERVER_ROUTES = ['/', '/events', '/communities'];

// --- Built server -------------------------------------------------------------------------------

async function startServer() {
  const server = spawn('node', ['dist/web/server/server.mjs'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT) },
    // Its errors are the only clue when it does not start.
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`${API}/home`)).ok) return server;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  server.kill();
  throw new Error('postbuild: the built server did not start');
}

const get = async (path) => {
  const response = await fetch(`${API}/${path}`);
  if (!response.ok) throw new Error(`postbuild: GET /api/${path} → ${response.status}`);
  return response.json();
};

// --- Sitemap ------------------------------------------------------------------------------------

function writeSitemap() {
  const prerendered = Object.keys(
    JSON.parse(readFileSync(join(DIST, 'prerendered-routes.json'), 'utf8')).routes,
  );
  // No <lastmod>: a build date on every URL would tell crawlers that everything changed.
  const routes = [...new Set([...prerendered, ...SERVER_ROUTES])].sort();
  const escape = (value) => value.replace(/&/g, '&amp;');
  writeFileSync(
    join(BROWSER, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) =>
      `  <url><loc>${escape(`${SITE_URL}${route === '/' ? '' : encodeURI(route)}`)}</loc></url>`,
  )
  .join('\n')}
</urlset>
`,
  );
  writeFileSync(
    join(BROWSER, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  );
  return routes.length;
}

// --- Open Graph images --------------------------------------------------------------------------

const W = 1200;
const H = 630;
const LOGO = `data:image/png;base64,${readFileSync(join(OG, 'logo.png')).toString('base64')}`;
const GRADIENT = ['#d050cc', '#9a86ef', '#3fa4fb', '#22b8f6', '#00bee0'];
const STATUS = {
  experimental: { label: 'Experimental', color: '#f59e0b' },
  preview: { label: 'Developer Preview', color: '#3b82f6' },
  stable: { label: 'Stable', color: '#22c55e' },
  deprecated: { label: 'Deprecated', color: '#ef4444' },
  removed: { label: 'Removed', color: '#dc2626' },
};

const xml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A rectangle with stepped "pixel" corners (two steps of `px`). */
function pixelRect(x, y, w, h, px, attrs) {
  const p = [
    [x + 2 * px, y],
    [x + w - 2 * px, y],
    [x + w - 2 * px, y + px],
    [x + w - px, y + px],
    [x + w - px, y + 2 * px],
    [x + w, y + 2 * px],
    [x + w, y + h - 2 * px],
    [x + w - px, y + h - 2 * px],
    [x + w - px, y + h - px],
    [x + w - 2 * px, y + h - px],
    [x + w - 2 * px, y + h],
    [x + 2 * px, y + h],
    [x + 2 * px, y + h - px],
    [x + px, y + h - px],
    [x + px, y + h - 2 * px],
    [x, y + h - 2 * px],
    [x, y + 2 * px],
    [x + px, y + 2 * px],
    [x + px, y + px],
    [x + 2 * px, y + px],
  ];
  return `<polygon points="${p.map(([a, b]) => `${a},${b}`).join(' ')}" ${attrs}/>`;
}

/** Splits a title into at most two lines and picks the biggest size that fits. */
function fitTitle(text, { maxWidth = 1060, from = 120, to = 48 } = {}) {
  // Jersey 10 is narrow: about 0.42 em per character on average.
  const widthOf = (line, size) => line.length * size * 0.42;
  for (let size = from; size >= to; size -= 4) {
    // Two lines only below 100px, so the block keeps room for the subtitle.
    const maxLines = size > 100 ? 1 : 2;
    const lines = [];
    let current = '';
    for (const word of text.split(/\s+/)) {
      const next = current ? `${current} ${word}` : word;
      if (widthOf(next, size) <= maxWidth || !current) current = next;
      else {
        lines.push(current);
        current = word;
      }
    }
    lines.push(current);
    if (lines.length <= maxLines && lines.every((line) => widthOf(line, size) <= maxWidth)) {
      return { lines, size };
    }
  }
  return { lines: [text], size: Math.floor(maxWidth / (text.length * 0.42)) };
}

function card({ eyebrow, title, subtitle, status }) {
  const { lines, size } = fitTitle(title);
  // Top to bottom: eyebrow, title lines, subtitle, status pill.
  const eyebrowY = 196;
  const firstLine = eyebrowY + 18 + size * 0.85;
  const lastLine = firstLine + (lines.length - 1) * size * 0.95;
  const subtitleY = lastLine + 72;
  const pillY = subtitleY + 26;
  const squares = Array.from({ length: 30 }, (_, i) => {
    const color = GRADIENT[Math.floor((i / 30) * GRADIENT.length)];
    return `<rect x="${60 + i * 36}" y="566" width="28" height="12" fill="${color}" opacity="${0.35 + (i % 3) * 0.2}"/>`;
  }).join('');
  const pill = status
    ? (() => {
        const s = STATUS[status.status];
        const label = `${s.label} · ${status.version}`;
        const width = 44 + label.length * 17;
        return `${pixelRect(60, pillY, width, 56, 4, `fill="${s.color}" fill-opacity="0.18" stroke="${s.color}" stroke-width="2"`)}
  <rect x="80" y="${pillY + 20}" width="16" height="16" fill="${s.color}"/>
  <text x="108" y="${pillY + 37}" font-family="Inter" font-size="28" font-weight="600" fill="${s.color}">${xml(label)}</text>`;
      })()
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
      ${GRADIENT.map((color, i) => `<stop offset="${i / (GRADIENT.length - 1)}" stop-color="${color}"/>`).join('')}
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#bf25b9" stroke-opacity="0.08" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#09090b"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <image x="800" y="150" width="340" height="340" href="${LOGO}" opacity="0.14"/>
  ${pixelRect(1030, 70, 22, 22, 0, 'fill="#bf25b9" opacity="0.6"')}
  ${pixelRect(1100, 140, 14, 14, 0, 'fill="#1690fa" opacity="0.6"')}
  ${pixelRect(980, 190, 10, 10, 0, 'fill="#00bee0" opacity="0.6"')}
  <image x="56" y="44" width="84" height="84" href="${LOGO}"/>
  <text x="158" y="106" font-family="Jersey 10" font-size="60" fill="url(#brand)" letter-spacing="2">ANGULAR HUB</text>
  <text x="62" y="${eyebrowY}" font-family="Jersey 10" font-size="36" letter-spacing="6" fill="#d050cc">${xml(eyebrow.toUpperCase())}</text>
  ${lines
    .map(
      (line, i) =>
        `<text x="56" y="${firstLine + i * size * 0.95}" font-family="Jersey 10" font-size="${size}" fill="#fafafa">${xml(line)}</text>`,
    )
    .join('\n  ')}
  ${subtitle ? `<text x="60" y="${subtitleY}" font-family="Inter" font-size="32" fill="#a1a1aa">${xml(subtitle)}</text>` : ''}
  ${pill}
  ${squares}
  <text x="1140" y="${H - 22}" text-anchor="end" font-family="Inter" font-size="24" fill="#71717a">hub.openng.org</text>
</svg>`;
}

function render(svg, file) {
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: {
      fontFiles: [join(OG, 'Jersey10-Regular.ttf'), join(OG, 'Inter.ttf')],
      loadSystemFonts: false,
      defaultFontFamily: 'Inter',
    },
  })
    .render()
    .asPng();
  const path = join(BROWSER, 'og', file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, png);
}

const PAGES = [
  {
    file: 'home.png',
    eyebrow: 'Angular',
    title: 'Angular Hub',
    subtitle: 'Events, communities, feature support and release insights',
  },
  {
    file: 'events.png',
    eyebrow: 'Angular',
    title: 'Events',
    subtitle: 'Conferences, meetups and workshops, worldwide',
  },
  {
    file: 'communities.png',
    eyebrow: 'Angular',
    title: 'Communities',
    subtitle: 'The groups bringing Angular developers together',
  },
  {
    file: 'podcasts.png',
    eyebrow: 'Angular',
    title: 'Podcasts',
    subtitle: 'Shows about Angular, in several languages',
  },
  {
    file: 'caniuse.png',
    eyebrow: 'Angular',
    title: 'Can I Use',
    subtitle: 'Every feature, its status in every version',
  },
  {
    file: 'contribute.png',
    eyebrow: 'Contribute',
    title: 'Add to the hub',
    subtitle: 'Your event, community or podcast, in one pull request',
  },
];

async function writeImages() {
  let count = 0;
  for (const page of PAGES) {
    render(card(page), page.file);
    count++;
  }

  // Can I Use features, every page of the list.
  for (let page = 1, pageCount = 1; page <= pageCount; page++) {
    const list = await get(`caniuse/features?page=${page}`);
    pageCount = list.pageCount;
    for (const feature of list.items) {
      render(
        card({
          eyebrow: 'Angular Can I Use',
          title: feature.name,
          subtitle: feature.package ?? 'Angular',
          status: feature.latest,
        }),
        `caniuse/${feature.id}.png`,
      );
      count++;
    }
  }

  // Release insights, one per major.
  const { majors } = await get('releases');
  for (const major of majors) {
    const summary = await get(`releases/${major}`);
    const count_ = (id) => summary.sections.find((section) => section.id === id)?.count ?? 0;
    render(
      card({
        eyebrow: 'Release insights',
        title: `Angular ${major}`,
        subtitle: [
          summary.released,
          `${count_('features')} features changed`,
          `${count_('commits')} commits`,
        ]
          .filter(Boolean)
          .join(' · '),
      }),
      `releases/${major}.png`,
    );
    count++;
  }

  return count;
}

const started = Date.now();
const urls = writeSitemap();
const server = await startServer();
try {
  const images = await writeImages();
  console.log(
    `postbuild: sitemap.xml (${urls} URLs), robots.txt, ${images} Open Graph images in ${((Date.now() - started) / 1000).toFixed(1)}s`,
  );
} finally {
  server.kill();
}
