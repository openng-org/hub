import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LATEST_MAJOR } from '@openng/core-angular-versions';
import { POPULARITY_THRESHOLD, SUPPORT_WINDOW } from '@openng/data-libraries';

import { pageSeo } from '../../../core/services/seo';
import { PageHeader } from '../../../core/layout/page-header';

/** /libraries/score — how the library health score is computed, rule by rule. */
@Component({
  selector: 'hub-score-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeader],
  template: `
    <hub-page-header
      icon="pi pi-heart"
      eyebrow="Library health"
      title="The score"
      description="A number from 0 to 100 saying how safe it is to pick a library for a project on a given Angular major. It starts at 100, and each rule below takes points off."
    >
      <a
        hubHeaderActions
        class="hub-pixel-btn hub-pixel-btn-alt hub-pixel-btn-sm self-start shrink-0"
        routerLink="/libraries"
      >
        <span><i class="pi pi-arrow-left" aria-hidden="true"></i> All libraries</span>
      </a>
    </hub-page-header>

    <article class="max-w-3xl space-y-8">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-muted border-b border-surface">
              <th class="py-2 pr-4 font-medium">Rule</th>
              <th class="py-2 pr-4 font-medium">Check</th>
              <th class="py-2 font-medium whitespace-nowrap">Points</th>
            </tr>
          </thead>
          <tbody class="align-top">
            @for (rule of rules; track rule.name) {
              @for (check of rule.checks; track check.text; let first = $first) {
                <tr class="border-b border-surface">
                  <th scope="row" class="py-3 pr-4 text-left font-semibold whitespace-nowrap">
                    @if (first) {
                      {{ rule.name }}
                    }
                  </th>
                  <td class="py-3 pr-4">{{ check.text }}</td>
                  <td class="py-3 font-brand text-base whitespace-nowrap">{{ check.points }}</td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <section class="space-y-3">
        <h2 class="hub-page-title text-3xl">Grades</h2>
        <p>
          <strong>Good</strong> from 80, <strong>fair</strong> from 60, <strong>poor</strong>
          below. A critical or high vulnerability in the version you would install sets the score to
          0 whatever the rest: the badge shows a warning sign instead of a number.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="hub-page-title text-3xl">One score per major</h2>
        <p>
          The headline score is for Angular {{ latestMajor }}. Each library page also scores every
          major since 14, as if it were the one your project runs: the support and stale-release
          rules look at that major and the ones before it, and the vulnerabilities are those of the
          version recommended for it.
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="hub-page-title text-3xl">Where the facts come from</h2>
        <ul class="list-disc pl-5 space-y-2">
          <li>
            <strong>Version per major:</strong> the newest stable release on npm whose peer
            dependency range on <code>&#64;angular/core</code> (or another
            <code>&#64;angular/*</code>
            package when the library declares none on core) accepts the major. An open range such as
            <code>>=16.0.0</code> accepts every later major: that is how its author declared it,
            hence the stale-release rule.
          </li>
          <li>
            <strong>Advisories:</strong> the GitHub Advisory Database, where npm's own advisories
            come from, for the library itself. Its dependencies are not audited.
          </li>
          <li><strong>Downloads:</strong> npm's weekly count.</li>
          <li>
            <strong>Deprecated, archived:</strong> the deprecation flag of the latest version on
            npm; the archived flag of the GitHub repository the package declares.
          </li>
        </ul>
        <p class="text-muted text-sm">
          The data is refreshed every week. The list of libraries is curated in the repository: a
          missing one is a pull request on
          <a
            class="link underline"
            href="https://github.com/openng-org/hub/blob/main/packages/data-libraries/data/libraries.json"
            target="_blank"
            rel="noopener noreferrer"
            >libraries.json</a
          >.
        </p>
      </section>
    </article>
  `,
})
export default class ScorePage {
  protected readonly latestMajor = LATEST_MAJOR;
  protected readonly rules = [
    {
      name: 'Vulnerabilities',
      checks: [
        {
          text: 'A critical or high vulnerability in the version recommended for the major',
          points: 'score 0',
        },
        { text: 'Each moderate vulnerability in that version', points: '−5' },
        { text: 'Each low vulnerability in that version', points: '−2' },
      ],
    },
    {
      name: 'Support',
      checks: [
        {
          text: `Each of the ${SUPPORT_WINDOW} most recent majors (the major and the ones before it) with no stable version`,
          points: '−10',
        },
      ],
    },
    {
      name: 'Stale releases',
      checks: [
        {
          text: 'Each recent major served by the version that already served the major before it, published before that major came out',
          points: '−5',
        },
      ],
    },
    { name: 'Maturity', checks: [{ text: 'The recommended version is still 0.x', points: '−20' }] },
    {
      name: 'Popularity',
      checks: [
        {
          text: `Fewer than ${POPULARITY_THRESHOLD.toLocaleString('en')} weekly downloads on npm`,
          points: '−10',
        },
      ],
    },
    {
      name: 'Maintenance',
      checks: [{ text: 'Deprecated on npm, or the repository archived on GitHub', points: '−30' }],
    },
  ];

  constructor() {
    pageSeo({
      title: 'How the library health score works',
      description:
        'The rules behind the Angular library health score: vulnerabilities, support for recent majors, stale releases, maturity, popularity and maintenance, and where the data comes from.',
      path: '/libraries/score',
      image: '/og/libraries.png',
    });
  }
}
