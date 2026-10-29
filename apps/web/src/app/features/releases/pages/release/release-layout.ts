import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';

import { pageSeo } from '../../../../core/services/seo';
import { PageHeader } from '../../../../core/layout/page-header';
import NotFoundPage from '../../../../core/pages/not-found-page';
import { ChipFilter, type ChipOption } from '../../../../shared/components/chip-filter';
import type { ReleaseSectionId, ReleaseSummary } from '../../releases.model';

/** Page titles per section; the layout owns the SEO of every /releases/:version/… page. */
// TODO(migration-guide): the `guide` title is kept for when the hidden section comes back (see
// HIDDEN_SECTIONS in server/releases/index.ts).
const SECTION_TITLES: Record<ReleaseSectionId, (major: number) => string> = {
  overview: (major) => `What's new in Angular ${major}: release insights`,
  features: (major) => `Angular ${major} features: what changed stage`,
  guide: (major) => `Angular ${major} migration guide: what to check when updating`,
  update: (major) => `Angular ${major} ng update migrations`,
  commits: (major) => `Angular ${major} commits, release by release`,
  mcp: (major) => `Angular ${major} MCP server: new tools and resources`,
  eslint: (major) => `Angular ${major}: new angular-eslint rules`,
  changelogs: (major) => `Angular ${major} changelogs`,
};

const isSectionId = (value: string): value is ReleaseSectionId => value in SECTION_TITLES;

/**
 * /releases/:version/… — what one Angular major brought. The header, the version chips and the
 * section navigation stay; each section renders in the outlet and fetches its own view.
 */
@Component({
  selector: 'hub-release-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, PageHeader, ChipFilter, NotFoundPage],
  template: `
    @if (summary(); as summary) {
      <hub-page-header
        icon="pi pi-megaphone"
        eyebrow="Release insights"
        [title]="'Angular ' + summary.major"
        [description]="
          'What Angular ' +
          summary.major +
          ' brought, release by release: features that changed stage, the migrations ng update runs, every commit, and the tooling around it.'
        "
      >
        <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          @if (summary.released) {
            <span class="text-muted inline-flex items-center gap-1.5">
              <i class="pi pi-calendar" aria-hidden="true"></i>{{ summary.released }}
            </span>
          }
          @if (summary.latestVersion) {
            <span class="text-muted inline-flex items-center gap-1.5">
              <i class="pi pi-tag" aria-hidden="true"></i>Latest
              <span class="font-mono text-color">{{ summary.latestVersion }}</span>
            </span>
          }
        </div>
        @if (summary.resources.length > 0) {
          <div hubHeaderActions class="flex flex-wrap gap-3 shrink-0 lg:justify-end lg:max-w-xl">
            @for (link of summary.resources; track link.url) {
              <a
                class="hub-pixel-btn hub-pixel-btn-alt hub-pixel-btn-sm"
                [href]="link.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  ><i [class]="link.icon" aria-hidden="true"></i> {{ link.label }}
                  <i class="pi pi-external-link text-[0.6rem]" aria-hidden="true"></i
                ></span>
              </a>
            }
          </div>
        }
      </hub-page-header>

      <hub-chip-filter
        class="mb-8"
        label="Angular version"
        [options]="versionOptions()"
        [value]="currentVersion()"
        (valueChange)="goToVersion($event)"
      />

      <div class="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
        <nav
          aria-label="Release sections"
          class="hub-release-nav mb-8 lg:mb-0 lg:sticky lg:top-4 lg:self-start"
        >
          @for (section of summary.sections; track section.id) {
            <a
              [routerLink]="section.path"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: section.id === 'overview' }"
              ariaCurrentWhenActive="page"
            >
              <i [class]="section.icon" aria-hidden="true"></i>
              <span class="flex-1">{{ section.label }}</span>
              @if (section.count !== null) {
                <span class="hub-chip-count">{{ section.count }}</span>
              }
            </a>
          }
        </nav>
        <div class="min-w-0">
          <router-outlet />
        </div>
      </div>
    } @else {
      <hub-not-found-page />
    }
  `,
})
export default class ReleaseLayout {
  /** Resolved by the route; null for a major without insights. */
  readonly summary = input.required<ReleaseSummary | null>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly currentVersion = computed(() => String(this.summary()?.major ?? ''));
  protected readonly versionOptions = computed<ChipOption[]>(() =>
    (this.summary()?.majors ?? []).map((major) => ({ value: String(major), label: String(major) })),
  );

  /** The section shown in the outlet, from the child route. */
  private readonly sectionId = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.currentSection()),
    ),
    { initialValue: this.currentSection() },
  );

  constructor() {
    pageSeo(() => {
      const summary = this.summary();
      if (!summary) return undefined;
      const section =
        summary.sections.find((s) => s.id === this.sectionId()) ?? summary.sections[0];
      if (!section) return undefined;
      const overview = section.id === 'overview';
      return {
        title: SECTION_TITLES[section.id](summary.major),
        description: overview
          ? `Angular ${summary.major}: features that changed stage, ng update migrations, every commit and the changelogs.`
          : `Angular ${summary.major}: ${section.description.toLowerCase()}. Part of the Angular ${summary.major} release insights, with the ng update migrations, commits and changelogs.`,
        path: section.path.join('/'),
        image: `/og/releases/${summary.major}.png`,
        type: 'article',
        jsonLd: overview ? summary.jsonLd : undefined,
      };
    });
  }

  // Not from the summary: the inputs are not set yet when the field initializers run. During the
  // first activation the child route has no snapshot yet; NavigationEnd then brings the section.
  private currentSection(): ReleaseSectionId {
    const segment = this.route.firstChild?.snapshot?.url[0]?.path ?? '';
    return isSectionId(segment) ? segment : 'overview';
  }

  /** Same section, another major. */
  protected goToVersion(version: string): void {
    const section = this.route.firstChild?.snapshot.url.map((segment) => segment.path) ?? [];
    void this.router.navigate(['/releases', version, ...section]);
  }
}
