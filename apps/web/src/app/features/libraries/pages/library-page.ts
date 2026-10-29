import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { MenuItem } from '@openng/optimus-ui/api';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';

import { pageSeo } from '../../../core/services/seo';
import NotFoundPage from '../../../core/pages/not-found-page';
import type { LibraryDetail } from '../libraries.model';
import { ExperimentalBanner } from '../components/experimental-banner';
import { LibraryDetailView } from '../components/library-detail';

/**
 * /libraries/:name — one tracked library (components/library-detail.ts), under its breadcrumb.
 */
@Component({
  selector: 'hub-library-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, LibraryDetailView, ExperimentalBanner, NotFoundPage],
  template: `
    @if (library(); as lib) {
      <p-breadcrumb [model]="breadcrumb()" [home]="home" class="mb-6 block" />
      <hub-experimental-banner class="mb-8 max-w-3xl" />

      <hub-library-detail [library]="lib" />
    } @else {
      <hub-not-found-page />
    }
  `,
})
export default class LibraryPage {
  /** Resolved by the route; `null` when the hub does not track the library. */
  readonly library = input.required<LibraryDetail | null>();

  protected readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  protected readonly breadcrumb = computed<MenuItem[]>(() => [
    { label: 'Library health', routerLink: '/libraries' },
    { label: this.library()?.name ?? 'Library', styleClass: 'font-mono' },
  ]);

  constructor() {
    pageSeo(() => {
      const lib = this.library();
      if (!lib) return undefined;
      const supported = lib.majors.filter((row) => row.version).map((row) => row.major);
      const latest = supported[0];
      return {
        title: `${lib.name}: Angular ${lib.latestMajor} support and health score`,
        description: `${lib.name} ${
          lib.score.retired
            ? `is ${lib.score.retired} (no health score)`
            : `scores ${lib.score.score}/100`
        } for Angular ${lib.latestMajor}${
          latest === lib.latestMajor
            ? ` and supports it with version ${lib.majors[0]!.version}`
            : latest
              ? `; its newest supported major is Angular ${latest}`
              : ''
        }. Version to use per Angular major, advisories, downloads and maintenance.`,
        path: lib.path.join('/'),
        image: `/og/libraries/${lib.name.replace('/', '__')}.png`,
        type: 'article',
      };
    });
  }
}
