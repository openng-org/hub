import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TagModule } from '@openng/optimus-ui/tag';

import { latestValue } from '../../core/query-params';
import { pageSeo } from '../../core/seo';
import { PageHeader } from '../../layout/page-header';
import { LoadError } from '../../ui/load-error';
import { Loading } from '../../ui/loading';
import { LogoFrame } from '../../ui/logo-frame';
import { CommunityApi } from '../data/community-api';

/** /podcasts — Angular shows to listen to; each card opens the podcast in a new tab. */
@Component({
  selector: 'hub-podcasts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TagModule, PageHeader, LoadError, Loading, LogoFrame],
  template: `
    <hub-page-header
      icon="pi pi-microphone"
      title="Podcasts"
      description="Angular talk for your commute: shows about the framework and its ecosystem, in several languages."
    >
      <a
        class="hub-pixel-btn hub-pixel-btn-alt hub-pixel-btn-sm mt-5"
        routerLink="/contribute"
        [queryParams]="{ kind: 'podcast' }"
      >
        <span><i class="pi pi-plus" aria-hidden="true"></i> Add a podcast</span>
      </a>
    </hub-page-header>

    @if (list.error()) {
      <hub-load-error what="the podcasts" (retry)="list.reload()" />
    } @else if (data(); as list) {
      <ul class="grid gap-5 md:grid-cols-2">
        @for (podcast of list.items; track podcast.name) {
          <li
            class="hub-card-link flex gap-4 p-4 rounded-border border border-surface bg-surface-50 dark:bg-surface-900 hover:border-primary transition-colors"
          >
            <hub-logo-frame [src]="podcast.logo" [name]="podcast.name" class="size-24" />
            <div class="min-w-0 flex-1">
              <div class="flex items-start gap-2">
                <h2 class="font-semibold text-lg leading-snug">
                  <a
                    class="hub-card-link-target"
                    [href]="podcast.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ podcast.name }}</a
                  >
                </h2>
                <p-tag [value]="podcast.language" severity="secondary" class="ml-auto shrink-0" />
              </div>
              @if (podcast.lastEpisode; as lastEpisode) {
                <p class="text-xs uppercase tracking-wider text-muted mt-0.5">{{ lastEpisode }}</p>
              }
              <p class="text-sm text-muted leading-relaxed mt-1">{{ podcast.description }}</p>
            </div>
          </li>
        }
      </ul>
    } @else {
      <hub-loading
        grid="grid gap-5 md:grid-cols-2"
        [rows]="4"
        height="8rem"
        label="Loading podcasts"
      />
    }
  `,
})
export default class PodcastsPage {
  private readonly api = inject(CommunityApi);

  protected readonly list = resource({ loader: () => this.api.podcasts() });
  protected readonly data = latestValue(this.list);

  constructor() {
    pageSeo({
      title: 'Angular podcasts',
      description: 'Podcasts about Angular and its ecosystem, in several languages.',
      path: '/podcasts',
      image: '/og/podcasts.png',
    });
  }
}
