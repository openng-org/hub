import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LATEST_MAJOR } from '@openng/core-angular-versions';

import { latestValue } from '../../../core/utils/query-params.utils';
import { pageSeo, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../../../core/services/seo';
import { NAV_SECTIONS } from '../../../core/layout/nav';
import { LoadError } from '../../../shared/components/load-error';
import { Loading } from '../../../shared/components/loading';
import { PixelBadge } from '../../../shared/components/pixel-badge';
import { HomeApi } from '../home-api';
import { ReleaseTimelineView } from '../components/release-timeline';

/** A world of the level select: a menu section, its links numbered like levels ("1-2"). */
const WORLDS = NAV_SECTIONS.map((section, index) => ({
  number: index + 1,
  label: section.label,
  icon: section.icon,
  levels: section.items
    .flat()
    .flatMap((group) => group.items)
    .map((link, level) => ({ ...link, code: `${index + 1}-${level + 1}` })),
}));

/** Decorative pixels drifting in the hero: position, size and delay. */
const PIXELS = [
  { x: 8, y: 22, size: 14, delay: 0 },
  { x: 16, y: 70, size: 10, delay: 1.2 },
  { x: 27, y: 12, size: 8, delay: 2.1 },
  { x: 74, y: 16, size: 12, delay: 0.6 },
  { x: 86, y: 58, size: 16, delay: 1.7 },
  { x: 92, y: 26, size: 8, delay: 2.6 },
  { x: 68, y: 80, size: 10, delay: 0.9 },
];

/**
 * The home page as a game title screen: the logo and the pixel wordmark, a timeline of every
 * Angular major and its support status, the sections of the site as worlds of a level select, and a
 * call to contribute.
 */
@Component({
  selector: 'hub-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PixelBadge, ReleaseTimelineView, LoadError, Loading],
  template: `
    <section class="hub-hero relative -mx-4 -mt-8 px-4 pt-16 pb-14 md:pt-24 md:pb-20 text-center">
      <div class="hub-hero-grid" aria-hidden="true"></div>
      @for (pixel of pixels; track $index) {
        <span
          class="hub-hero-pixel"
          aria-hidden="true"
          [style.left.%]="pixel.x"
          [style.top.%]="pixel.y"
          [style.width.px]="pixel.size"
          [style.height.px]="pixel.size"
          [style.animation-delay.s]="pixel.delay"
        ></span>
      }

      <div class="relative">
        <img
          src="/images/logo.webp"
          alt=""
          width="128"
          height="128"
          class="hub-hero-logo mx-auto size-24 md:size-32"
        />
        <h1 class="mt-6 leading-none flex flex-col items-center">
          <span class="hub-wordmark inline-block text-3xl md:text-5xl tracking-[0.35em] pl-[0.35em]"
            >ANGULAR</span
          >
          <span class="hub-wordmark hub-hero-title inline-block text-[7rem] md:text-[11rem]"
            >HUB</span
          >
        </h1>
        <p class="hub-pixel-box mx-auto mt-6 max-w-xl text-lg text-muted">
          Community-driven data and tools for the Angular ecosystem — events, communities, podcasts,
          feature support and release insights, all in one place.
        </p>

        <div class="flex flex-wrap justify-center gap-4 mt-10">
          <a class="hub-pixel-btn" [routerLink]="['/releases', latest]">
            <span
              ><i class="pi pi-megaphone" aria-hidden="true"></i> What's new in Angular
              {{ latest }}</span
            >
          </a>
          <a class="hub-pixel-btn hub-pixel-btn-alt" routerLink="/events">
            <span><i class="pi pi-calendar" aria-hidden="true"></i> Find an event</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Too wide to read on a phone: shown from md up. -->
    <section aria-labelledby="timeline-title" class="my-16 hidden md:block">
      <h2 id="timeline-title" class="hub-page-title text-5xl text-center mb-2">Release timeline</h2>
      <p class="text-center text-muted mb-6">
        Every Angular major since 2016, and how long the current ones stay supported.
      </p>
      @if (home.error()) {
        <hub-load-error what="the timeline" (retry)="home.reload()" />
      } @else if (data(); as data) {
        <hub-release-timeline [timeline]="data.timeline" />
      } @else {
        <hub-loading [rows]="1" height="14rem" label="Loading the timeline" />
      }
    </section>

    <section aria-labelledby="worlds-title" class="mb-16">
      <h2 id="worlds-title" class="hub-page-title text-5xl text-center mb-2">Choose your world</h2>
      <p class="text-center text-muted mb-8">Every corner of the hub, one level at a time.</p>
      <div class="grid gap-6 lg:grid-cols-3">
        @for (world of worlds; track world.label) {
          <article class="hub-pixel-frame p-5">
            <header class="flex items-center gap-4 mb-5">
              <hub-pixel-badge [icon]="world.icon" class="size-14" />
              <div>
                <p class="hub-wordmark w-fit text-lg tracking-[0.2em]">WORLD {{ world.number }}</p>
                <h3 class="hub-page-title text-4xl">{{ world.label }}</h3>
              </div>
            </header>
            <ol class="space-y-1">
              @for (level of world.levels; track level.code) {
                <li
                  class="hub-card-link hub-level flex items-center gap-3 rounded-border px-2 py-2 hover:bg-emphasis transition-colors"
                >
                  <span class="hub-level-code" aria-hidden="true">{{ level.code }}</span>
                  <span class="min-w-0">
                    <a
                      class="hub-card-link-target font-medium block"
                      [routerLink]="level.routerLink"
                      >{{ level.label }}</a
                    >
                    <span class="block text-xs text-muted truncate">{{ level.description }}</span>
                  </span>
                  <i
                    class="pi pi-chevron-right text-xs text-muted ml-auto hub-level-arrow"
                    aria-hidden="true"
                  ></i>
                </li>
              }
            </ol>
          </article>
        }
      </div>
    </section>

    <section class="hub-coin hub-pixel-box mb-16 px-6! py-10! text-center">
      <p class="max-w-2xl mx-auto text-muted mb-6">
        Every dataset is a JSON file anyone can improve with a pull request. Merge it, and the site
        levels up for everyone.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a
          class="hub-pixel-btn"
          href="https://github.com/openng-org/hub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span><i class="pi pi-github" aria-hidden="true"></i> Contribute on GitHub</span>
        </a>
        <a class="hub-pixel-btn hub-pixel-btn-alt" routerLink="/contribute">
          <span><i class="pi pi-send" aria-hidden="true"></i> Add your event</span>
        </a>
      </div>
    </section>
  `,
})
export default class HomePage {
  private readonly api = inject(HomeApi);

  protected readonly latest = LATEST_MAJOR;
  protected readonly worlds = WORLDS;
  protected readonly pixels = PIXELS;

  protected readonly home = resource({ loader: () => this.api.home() });
  protected readonly data = latestValue(this.home);

  constructor() {
    pageSeo({
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      path: '/',
      image: '/og/home.png',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: {
          '@type': 'Organization',
          name: 'OpenNG Foundation',
          url: 'https://github.com/openng-org',
        },
      },
    });
  }
}
