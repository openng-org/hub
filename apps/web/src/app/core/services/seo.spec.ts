import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { Seo, SITE_NAME } from './seo';

describe('Seo', () => {
  const setup = () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    return {
      seo: TestBed.inject(Seo),
      document: TestBed.inject(DOCUMENT),
      meta: TestBed.inject(Meta),
      title: TestBed.inject(Title),
    };
  };

  it('sets the title, description, canonical URL and social tags of a page', () => {
    const { seo, document, meta, title } = setup();
    seo.set({
      title: 'Angular events',
      description: 'Upcoming Angular events.',
      path: '/events',
      image: '/og/events.png',
    });
    expect(title.getTitle()).toBe(`Angular events | ${SITE_NAME}`);
    expect(meta.getTag('name="description"')?.content).toBe('Upcoming Angular events.');
    expect(meta.getTag('name="robots"')?.content).toBe('index, follow');
    expect(meta.getTag('property="og:url"')?.content).toBe('https://hub.openng.org/events');
    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://hub.openng.org/og/events.png',
    );
    expect(meta.getTag('name="twitter:card"')?.content).toBe('summary_large_image');
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      'https://hub.openng.org/events',
    );
  });

  it('keeps the bare site name on the home page and one canonical link across pages', () => {
    const { seo, document, title } = setup();
    seo.set({ title: SITE_NAME, description: 'd', path: '/' });
    expect(title.getTitle()).toBe(SITE_NAME);
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      'https://hub.openng.org/',
    );
    seo.set({ title: 'Podcasts', description: 'd', path: '/podcasts', noindex: true });
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex');
  });

  it('replaces the JSON-LD block and escapes "<" inside it', () => {
    const { seo, document } = setup();
    seo.set({ title: 'A', description: 'd', jsonLd: { '@type': 'Thing', name: '<script>' } });
    const script = document.getElementById('hub-json-ld');
    expect(script?.getAttribute('type')).toBe('application/ld+json');
    expect(script?.textContent).toContain('\\u003cscript>');
    expect(script?.textContent).not.toContain('<script>');
    seo.set({ title: 'B', description: 'd' });
    expect(document.getElementById('hub-json-ld')).toBeNull();
  });
});
