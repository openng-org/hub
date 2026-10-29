import { ChangeDetectionStrategy, Component, computed, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconField } from '@openng/optimus-ui/iconfield';
import { InputIcon } from '@openng/optimus-ui/inputicon';
import { InputText } from '@openng/optimus-ui/inputtext';

import { apiUrl } from '../../../core/api/api.utils';
import { PageHeader } from '../../../core/layout/page-header';
import { pageSeo } from '../../../core/services/seo';
import { injectQueryParams } from '../../../core/utils/query-params.utils';
import { EmptyState } from '../../../shared/components/empty-state';
import { Loading } from '../../../shared/components/loading';
import { ExperimentalBanner } from '../components/experimental-banner';
import { LibraryDetailView } from '../components/library-detail';
import type { LibraryCheck, LibraryCheckError } from '../libraries.model';

const ERRORS: Record<LibraryCheckError['error'], { title: string; message: string }> = {
  'invalid-name': {
    title: 'Not an npm package',
    message:
      'Paste a package URL from npmjs.com (https://www.npmjs.com/package/@ngrx/store) or a package name (@ngrx/store, primeng).',
  },
  'not-found': {
    title: 'No such package on npm',
    message: 'npm has no package by that name, or none of its versions is published.',
  },
  unreachable: {
    title: 'npm did not answer',
    message: 'The registry could not be reached from the hub. Try again in a moment.',
  },
};

/**
 * /libraries/check?package= — the health of any npm package, read live from npm and GitHub with
 * the same rules as the tracked libraries. The package is in the URL, so a check can be shared.
 */
@Component({
  selector: 'hub-check-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    IconField,
    InputIcon,
    InputText,
    PageHeader,
    EmptyState,
    Loading,
    ExperimentalBanner,
    LibraryDetailView,
  ],
  template: `
    <hub-page-header
      icon="pi pi-search-plus"
      eyebrow="Ecosystem · Library health"
      title="Check a package"
      description="Any npm package, scored live: paste its npm URL or name to see which Angular majors it supports, the version to use for each, its advisories and its health score."
    >
      <a
        hubHeaderActions
        class="hub-pixel-btn hub-pixel-btn-alt hub-pixel-btn-sm self-start shrink-0"
        routerLink="/libraries"
      >
        <span><i class="pi pi-box" aria-hidden="true"></i> Tracked libraries</span>
      </a>
    </hub-page-header>

    <hub-experimental-banner class="mb-6 max-w-3xl" />

    <form
      class="flex flex-col sm:flex-row gap-3 max-w-3xl mb-8"
      role="search"
      (submit)="$event.preventDefault(); check()"
    >
      <p-iconfield class="flex-1">
        <p-inputicon class="pi pi-link" />
        <input
          pInputText
          type="text"
          class="w-full"
          name="package"
          aria-label="npm package URL or name"
          placeholder="https://www.npmjs.com/package/@ngrx/store"
          autocomplete="off"
          spellcheck="false"
          [ngModel]="input()"
          (ngModelChange)="input.set($event)"
        />
      </p-iconfield>
      <button type="submit" class="hub-pixel-btn shrink-0" [disabled]="!input().trim()">
        <span><i class="pi pi-bolt" aria-hidden="true"></i> Check live</span>
      </button>
    </form>

    @if (!packageParam()) {
      <p class="text-sm text-muted max-w-2xl">
        Try
        <a class="link underline" routerLink="." [queryParams]="{ package: 'ngx-toastr' }"
          >ngx-toastr</a
        >,
        <a
          class="link underline"
          routerLink="."
          [queryParams]="{ package: '@ngneat/until-destroy' }"
          >&#64;ngneat/until-destroy</a
        >
        or
        <a class="link underline" routerLink="." [queryParams]="{ package: 'ag-grid-angular' }"
          >ag-grid-angular</a
        >. A check reads npm and GitHub as you wait, so it takes a few seconds; the tracked
        libraries have <a class="link underline" routerLink="/libraries">their numbers ready</a>.
      </p>
    } @else if (result.isLoading()) {
      <hub-loading [label]="'Reading npm and GitHub for ' + packageParam() + '…'" />
    } @else if (result.error() || !result.value()) {
      <hub-empty-state
        class="max-w-xl"
        icon="pi pi-exclamation-triangle"
        [title]="errors.unreachable.title"
        [message]="errors.unreachable.message"
      >
        <button type="button" class="hub-pixel-btn hub-pixel-btn-sm mt-3" (click)="result.reload()">
          <span><i class="pi pi-refresh" aria-hidden="true"></i> Try again</span>
        </button>
      </hub-empty-state>
    } @else if (failure(); as failure) {
      <hub-empty-state
        class="max-w-xl"
        icon="pi pi-exclamation-triangle"
        [title]="failure.title"
        [message]="failure.message"
      />
    } @else if (checked(); as checked) {
      <section aria-labelledby="result-title" class="space-y-6">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <h2 id="result-title" class="sr-only">Result for {{ checked.detail.name }}</h2>
          <span
            ><i class="pi pi-bolt text-status-experimental" aria-hidden="true"></i> Checked
            live</span
          >
          @if (checked.tracked) {
            <span
              >The hub tracks this library:
              <a class="link underline" [routerLink]="checked.detail.path">see its page</a>, with
              the weekly-synced numbers.</span
            >
          } @else {
            <span
              >Not tracked by the hub yet:
              <a
                class="link underline"
                href="https://github.com/openng-org/hub/blob/main/packages/data-libraries/data/libraries.json"
                target="_blank"
                rel="noopener noreferrer"
                >add it to the list</a
              >.</span
            >
          }
        </div>
        @if (checked.caveats.length > 0) {
          <aside
            class="hub-pixel-box border-l-4 border-status-preview text-sm max-w-3xl"
            aria-label="Partial result"
          >
            <p><strong>Partial result.</strong> The rules below were left out of the score:</p>
            <ul class="list-disc ml-5 mt-1 space-y-0.5">
              @for (caveat of checked.caveats; track caveat) {
                <li>{{ caveat }}</li>
              }
            </ul>
          </aside>
        }
        <hub-library-detail [library]="checked.detail" />
      </section>
    }
  `,
})
export default class CheckPage {
  private readonly params = injectQueryParams();

  /** The package in the URL: what is being checked. */
  protected readonly packageParam = this.params.get('package');
  /** What the visitor typed, until they submit it; follows the URL when a link sets it. */
  protected readonly input = linkedSignal(() => this.packageParam());

  protected readonly result = httpResource<LibraryCheck | LibraryCheckError>(() => {
    const input = this.packageParam();
    return input ? apiUrl('libraries/check', { package: input }) : undefined;
  });
  protected readonly failure = computed(() => {
    const value = this.result.value();
    return value && 'error' in value ? ERRORS[value.error] : null;
  });
  protected readonly checked = computed(() => {
    const value = this.result.value();
    return value && !('error' in value) ? value : null;
  });
  protected readonly errors = ERRORS;

  protected check(): void {
    this.params.set('package', this.input().trim());
  }

  constructor() {
    pageSeo({
      title: 'Check any npm package for Angular support',
      description:
        'Paste an npm URL or package name: which Angular majors it supports, the version to use for each, its advisories and a live health score.',
      path: '/libraries/check',
      image: '/og/libraries.png',
    });
  }
}
