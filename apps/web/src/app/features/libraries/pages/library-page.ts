import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { MenuItem } from '@openng/optimus-ui/api';
import { BreadcrumbModule } from '@openng/optimus-ui/breadcrumb';

import { pageSeo } from '../../../core/services/seo';
import NotFoundPage from '../../../core/pages/not-found-page';
import type { HealthRule, LibraryDetail } from '../libraries.model';
import { ExperimentalBanner } from '../components/experimental-banner';
import { HealthBadge } from '../components/health-badge';

const RULE_LABELS: Record<HealthRule, string> = {
  vulnerabilities: 'Vulnerabilities',
  support: 'Angular support',
  stale: 'Stale releases',
  maturity: 'Maturity',
  popularity: 'Popularity',
  maintenance: 'Maintenance',
};

/**
 * /libraries/:name — one library: its health score for the latest major and why, then a row per
 * Angular major with the version to use, its advisories and the score for that major.
 */
@Component({
  selector: 'hub-library-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BreadcrumbModule, HealthBadge, ExperimentalBanner, NotFoundPage],
  template: `
    @if (library(); as lib) {
      <p-breadcrumb [model]="breadcrumb()" [home]="home" class="mb-6 block" />
      <hub-experimental-banner class="mb-8 max-w-3xl" />

      <header class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div class="min-w-0">
          <p class="hub-wordmark text-lg md:text-xl leading-none tracking-[0.2em] uppercase">
            {{ lib.categoryLabel }}
          </p>
          <h1 class="hub-page-title text-4xl md:text-5xl break-all leading-[0.9] mt-1">
            {{ lib.name }}
          </h1>
          @if (lib.description) {
            <p class="hub-pixel-box mt-5 max-w-2xl text-muted">{{ lib.description }}</p>
          }
          <dl class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <dt class="text-muted inline">Latest</dt>
              <dd class="inline font-mono ml-1">{{ lib.latest }}</dd>
              <dd class="inline text-muted ml-1">({{ lib.latestReleased }})</dd>
            </div>
            <div>
              <dt class="text-muted inline">Downloads</dt>
              <dd class="inline ml-1">{{ lib.downloads }}</dd>
            </div>
            @if (lib.license) {
              <div>
                <dt class="text-muted inline">License</dt>
                <dd class="inline ml-1">{{ lib.license }}</dd>
              </div>
            }
          </dl>
          <p class="mt-3 flex flex-wrap gap-4 text-sm">
            <a class="link" [href]="lib.npmUrl" target="_blank" rel="noopener noreferrer"
              ><i class="pi pi-external-link text-xs" aria-hidden="true"></i> npm</a
            >
            @if (lib.repository; as repository) {
              <a class="link" [href]="repository" target="_blank" rel="noopener noreferrer"
                ><i class="pi pi-github text-xs" aria-hidden="true"></i> GitHub</a
              >
            }
          </p>
        </div>

        <section
          class="hub-pixel-box shrink-0 lg:w-80 flex flex-col gap-3"
          aria-labelledby="score-title"
        >
          <div class="flex items-center gap-4">
            <hub-health-badge
              [badge]="lib.score"
              size="lg"
              [context]="'for Angular ' + lib.latestMajor"
            />
            <div>
              <h2 id="score-title" class="font-semibold leading-tight">
                Health for Angular {{ lib.latestMajor }}
              </h2>
              <p class="text-sm text-muted">
                @if (lib.score.retired) {
                  {{ lib.score.retired === 'deprecated' ? 'Deprecated' : 'Archived' }}: no score
                } @else if (lib.score.blocked) {
                  Blocked by a vulnerability
                } @else if (lib.score.reasons.length === 0) {
                  Nothing to flag
                } @else {
                  {{ lib.score.reasons.length }}
                  {{ lib.score.reasons.length === 1 ? 'thing' : 'things' }} to know
                }
              </p>
            </div>
          </div>
          @if (!lib.score.retired && lib.score.reasons.length > 0) {
            <ul class="space-y-2 text-sm">
              @for (reason of lib.score.reasons; track $index) {
                <li class="flex gap-2">
                  <span
                    class="font-brand text-base leading-none pt-1 text-status-deprecated shrink-0 w-10"
                    >−{{ reason.points }}</span
                  >
                  <span>
                    <span class="font-medium">{{ ruleLabels[reason.rule] }}.</span>
                    <span class="text-muted"> {{ reason.detail }}</span>
                  </span>
                </li>
              }
            </ul>
          }
          <a routerLink="/libraries/score" class="link text-xs">How the score works</a>
        </section>
      </header>

      @if (lib.undeclared) {
        <p class="mt-6 hub-pixel-box border-l-4 border-status-preview text-sm" role="note">
          <strong>No Angular peer range declared.</strong> {{ lib.name }} does not say which Angular
          versions it supports in its package.json, so the versions below are its latest and the
          support rules do not apply. Check its documentation before picking a version.
        </p>
      }
      @if (lib.deprecated; as message) {
        <p class="mt-6 hub-pixel-box border-l-4 border-status-deprecated text-sm" role="note">
          <strong>Deprecated on npm.</strong> {{ message }}
        </p>
      } @else if (lib.archived) {
        <p class="mt-6 hub-pixel-box border-l-4 border-status-deprecated text-sm" role="note">
          <strong>Archived.</strong> The repository is archived on GitHub: no fixes or releases are
          coming.
        </p>
      }

      <section class="mt-10" aria-labelledby="majors-title">
        <h2 id="majors-title" class="hub-page-title text-3xl mb-1">Version by Angular major</h2>
        <p class="text-sm text-muted mb-4 max-w-2xl">
          For each Angular major, the newest stable release of {{ lib.name }} whose peer range
          accepts it, and the score you would get picking it for a project on that major.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-muted border-b border-surface">
                <th class="py-2 pr-4 font-medium whitespace-nowrap">Angular</th>
                <th class="py-2 pr-4 font-medium">Version to use</th>
                <th class="py-2 pr-4 font-medium whitespace-nowrap">Peer range</th>
                <th class="py-2 pr-4 font-medium whitespace-nowrap">Released</th>
                <th class="py-2 pr-4 font-medium">Advisories</th>
                <th class="py-2 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              @for (row of lib.majors; track row.major) {
                <tr class="border-b border-surface align-top">
                  <th scope="row" class="py-3 pr-4 text-left font-semibold whitespace-nowrap">
                    {{ row.major }}
                    @if (row.major === lib.latestMajor) {
                      <span class="sr-only">(latest)</span>
                    }
                  </th>
                  <td class="py-3 pr-4">
                    @if (row.version) {
                      <span class="font-mono">{{ row.version }}</span>
                      @if (row.sameAsPrevious && row.peer !== null) {
                        <span class="block text-xs text-muted">
                          Same version as for Angular {{ row.major - 1 }}
                        </span>
                      }
                    } @else {
                      <span class="text-muted">No stable version</span>
                    }
                  </td>
                  <td class="py-3 pr-4 font-mono text-xs text-muted whitespace-nowrap">
                    {{ row.peer ?? (row.version ? 'not declared' : '—') }}
                  </td>
                  <td class="py-3 pr-4 text-muted whitespace-nowrap">{{ row.released ?? '—' }}</td>
                  <td class="py-3 pr-4">
                    @if (row.vulnerabilities.length === 0) {
                      <span class="text-muted">{{ row.version ? 'None known' : '—' }}</span>
                    } @else {
                      <ul class="space-y-1">
                        @for (vuln of row.vulnerabilities; track vuln.id) {
                          <li>
                            <a
                              class="link"
                              [href]="vuln.url"
                              target="_blank"
                              rel="noopener noreferrer"
                              ><span
                                class="font-brand text-base uppercase mr-1"
                                [class]="severityClass(vuln.severity)"
                                >{{ vuln.severity }}</span
                              >{{ vuln.summary }}</a
                            >
                          </li>
                        }
                      </ul>
                    }
                  </td>
                  <td class="py-2.5">
                    <hub-health-badge [badge]="row.score" [context]="'for Angular ' + row.major" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    } @else {
      <hub-not-found-page />
    }
  `,
})
export default class LibraryPage {
  /** Resolved by the route; `null` when the hub does not track the library. */
  readonly library = input.required<LibraryDetail | null>();

  protected readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  protected readonly ruleLabels = RULE_LABELS;

  protected readonly breadcrumb = computed<MenuItem[]>(() => [
    { label: 'Library health', routerLink: '/libraries' },
    { label: this.library()?.name ?? 'Library', styleClass: 'font-mono' },
  ]);

  protected severityClass(severity: string): string {
    return severity === 'critical' || severity === 'high'
      ? 'text-status-removed'
      : severity === 'moderate'
        ? 'text-status-experimental'
        : 'text-muted';
  }

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
