import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, untracked } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { SITE_NAME, SITE_URL } from '../../../site';

export { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../../../site';

export interface SeoPage {
  /** Page title, without the site name. */
  title: string;
  description: string;
  /** Canonical path; defaults to the current URL without its query string. */
  path?: string;
  /** Open Graph image path (see scripts/postbuild.mjs); the site's default otherwise. */
  image?: string;
  type?: 'website' | 'article';
  /** schema.org data (an object, or an array of them), built by the API. */
  jsonLd?: unknown;
  /** Keep the page out of search results (404s). */
  noindex?: boolean;
}

const JSON_LD_ID = 'hub-json-ld';

/**
 * Everything search engines and link previews read: title, description, canonical URL, Open Graph
 * and Twitter tags, robots, and the JSON-LD block. Pages call `set()` once their data is there;
 * on the server it lands in the HTML, in the browser it follows client-side navigation.
 */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  set(page: SeoPage): void {
    const title = page.title === SITE_NAME ? SITE_NAME : `${page.title} | ${SITE_NAME}`;
    const path = page.path ?? this.router.url.split(/[?#]/)[0] ?? '/';
    const url = `${SITE_URL}${path === '/' ? '' : path}`;
    const image = `${SITE_URL}${page.image ?? '/og/home.png'}`;

    this.title.setTitle(title);
    this.tag('name', 'description', page.description);
    this.tag('name', 'robots', page.noindex ? 'noindex' : 'index, follow');
    this.tag('property', 'og:site_name', SITE_NAME);
    this.tag('property', 'og:type', page.type ?? 'website');
    this.tag('property', 'og:title', title);
    this.tag('property', 'og:description', page.description);
    this.tag('property', 'og:url', url);
    this.tag('property', 'og:image', image);
    this.tag('property', 'og:image:width', '1200');
    this.tag('property', 'og:image:height', '630');
    this.tag('name', 'twitter:card', 'summary_large_image');
    this.tag('name', 'twitter:title', title);
    this.tag('name', 'twitter:description', page.description);
    this.tag('name', 'twitter:image', image);
    this.canonical(url);
    this.jsonLd(page.jsonLd);
  }

  private tag(attribute: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attribute]: key, content }, `${attribute}="${key}"`);
  }

  private canonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }

  private jsonLd(data: unknown): void {
    this.document.getElementById(JSON_LD_ID)?.remove();
    if (!data) return;
    const script = this.document.createElement('script');
    script.id = JSON_LD_ID;
    script.type = 'application/ld+json';
    // "<" escaped so a value can never close the script element.
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    this.document.head.appendChild(script);
  }
}

/**
 * Sets the page's SEO from its constructor: a fixed page, or a function of signals (re-applied when
 * they change; `undefined` while the data is loading).
 */
export function pageSeo(page: SeoPage | (() => SeoPage | undefined)): void {
  const seo = inject(Seo);
  if (typeof page !== 'function') {
    seo.set(page);
    return;
  }
  effect(() => {
    const current = page();
    if (current) untracked(() => seo.set(current));
  });
}
