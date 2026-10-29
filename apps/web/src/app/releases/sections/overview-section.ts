import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import type { ReleaseSummary } from '../data/api';

/** /releases/:version — the release video. */
@Component({
  selector: 'hub-overview-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (videoUrl(); as url) {
      <div class="hub-video max-w-4xl">
        <iframe
          [src]="url"
          [title]="'Angular ' + summary()?.major + ' release video'"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    }
  `,
})
export default class OverviewSection {
  /** The layout's resolved summary (inherited route data). */
  readonly summary = input.required<ReleaseSummary | null>();

  private readonly sanitizer = inject(DomSanitizer);

  /** youtube-nocookie: no tracking cookie until the visitor plays the video. */
  protected readonly videoUrl = computed(() => {
    const id = this.summary()?.youtubeVideoId;
    return id
      ? this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
        )
      : null;
  });
}
