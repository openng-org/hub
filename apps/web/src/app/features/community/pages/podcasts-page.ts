import { ChangeDetectionStrategy, Component } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Tag } from '@openng/optimus-ui/tag';

import { apiUrl } from '../../../core/api/api.utils';
import type { PodcastList } from '../community.model';
import { latestValue } from '../../../core/utils/query-params.utils';
import { pageSeo } from '../../../core/services/seo';
import { PageHeader } from '../../../core/layout/page-header';
import { LoadError } from '../../../shared/components/load-error';
import { Loading } from '../../../shared/components/loading';
import { LogoFrame } from '../../../shared/components/logo-frame';

/** /podcasts — Angular shows to listen to; each card opens the podcast in a new tab. */
@Component({
  selector: 'hub-podcasts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Tag, PageHeader, LoadError, Loading, LogoFrame],
  template: `
    <hub-page-header
      icon="pi pi-microphone"
      title="Podcasts"
      description="Angular talk for your commute: shows about the framework and its ecosystem, in several languages."
    >
      <a
        hubHeaderActions
        class="hub-pixel-btn hub-pixel-btn-sm self-start shrink-0"
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
  protected readonly list = httpResource<PodcastList>(() => apiUrl('community/podcasts'));
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
