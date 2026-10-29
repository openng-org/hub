import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import type { Issue } from '@openng/data-community/validate';

import { apiUrl } from '../../../../core/api/api.utils';
import type { ContributeOptions } from '../../community.model';
import { injectQueryParams, latestValue } from '../../../../core/utils/query-params.utils';
import { pageSeo } from '../../../../core/services/seo';
import { PageHeader } from '../../../../core/layout/page-header';
import { ChipFilter } from '../../../../shared/components/chip-filter';
import { CopyButton } from '../../../../shared/components/copy-button';
import { LoadError } from '../../../../shared/components/load-error';
import { Loading } from '../../../../shared/components/loading';
import { CommunityForm } from './components/community-form';
import {
  EMPTY_DRAFT,
  KIND_OPTIONS,
  inboxPath,
  issuesOf,
  kindOf,
  pullRequestUrl,
  submissionJson,
  toSubmission,
  type Draft,
  type Kind,
} from './draft';
import { EventForm } from './components/event-form';
import { PodcastForm } from './components/podcast-form';

/**
 * /contribute — add an event, a community or a podcast: a form that builds the dataset entry, checks
 * it with the dataset's own rules (@openng/data-community/validate), and opens GitHub's "new file"
 * page with the entry ready in the inbox — committing it there proposes the pull request.
 */
@Component({
  selector: 'hub-contribute-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    ChipFilter,
    CopyButton,
    LoadError,
    Loading,
    EventForm,
    CommunityForm,
    PodcastForm,
  ],
  template: `
    <hub-page-header
      icon="pi pi-send"
      eyebrow="Contribute"
      title="Add to the hub"
      description="Every listing is a JSON file in the repository. Fill in the form: GitHub opens with the file ready, and committing it proposes the pull request."
    />

    <hub-chip-filter
      class="mb-8"
      label="What to add"
      [options]="kindOptions"
      [value]="kind()"
      (valueChange)="params.set('kind', $event === 'event' ? '' : $event)"
    />

    @if (options.error()) {
      <hub-load-error what="the form" (retry)="options.reload()" />
    } @else if (data(); as options) {
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <form class="hub-form min-w-0" (submit)="$event.preventDefault(); openPullRequest()">
          @switch (kind()) {
            @case ('event') {
              <hub-event-form [(draft)]="draft" [options]="options" [errors]="errors()" />
            }
            @case ('community') {
              <hub-community-form [(draft)]="draft" [errors]="errors()" />
            }
            @case ('podcast') {
              <hub-podcast-form [(draft)]="draft" [options]="options" [errors]="errors()" />
            }
          }
        </form>

        <aside class="lg:sticky lg:top-4 lg:self-start space-y-4 min-w-0">
          <div class="hub-pixel-box space-y-3">
            <p class="font-brand text-xl tracking-widest text-primary">YOUR PULL REQUEST</p>
            <ol class="text-sm text-muted list-decimal pl-5 space-y-1">
              <li>GitHub opens with this file ready (sign in if asked).</li>
              <li>
                Click <strong class="text-color">Commit changes…</strong>, then
                <strong class="text-color">Propose changes</strong>.
              </li>
              <li>
                Click <strong class="text-color">Create pull request</strong>. A maintainer merges
                it.
              </li>
            </ol>
            <p class="font-mono text-xs break-all text-muted">{{ path() }}</p>
            <div class="relative">
              <pre class="hub-code max-h-72" tabindex="0"><code>{{ json() }}</code></pre>
              <div class="absolute top-1 right-1">
                <hub-copy-button [text]="json()" label="Copy the JSON" />
              </div>
            </div>
            @if (showIssues() && issues().length > 0) {
              <p class="hub-error" role="alert">
                {{ issues().length }} {{ issues().length === 1 ? 'thing' : 'things' }} to fix in the
                form.
              </p>
            }
            <button type="button" class="hub-pixel-btn w-full" (click)="openPullRequest()">
              <span class="w-full justify-center"
                ><i class="pi pi-github" aria-hidden="true"></i> Open the pull request</span
              >
            </button>
          </div>
        </aside>
      </div>
    } @else {
      <hub-loading [rows]="1" height="24rem" label="Loading the form" />
    }
  `,
})
export default class ContributePage {
  private readonly document = inject(DOCUMENT);
  protected readonly params = injectQueryParams();

  protected readonly kindOptions = KIND_OPTIONS;

  /** Known communities, places, podcasts and languages: the choices and what to check against. */
  protected readonly options = httpResource<ContributeOptions>(() =>
    apiUrl('community/contribute'),
  );
  protected readonly data = latestValue(this.options);

  private readonly kindParam = this.params.get('kind');
  protected readonly kind = computed<Kind>(() => kindOf(this.kindParam()));

  /** Fresh fields for each kind. */
  protected readonly draft = linkedSignal<Kind, Draft>({
    source: this.kind,
    computation: () => ({ ...EMPTY_DRAFT }),
  });
  /** Errors show once the visitor tries to open the pull request (again for each kind). */
  protected readonly showIssues = linkedSignal<Kind, boolean>({
    source: this.kind,
    computation: () => false,
  });

  protected readonly submission = computed(() =>
    toSubmission(this.kind(), this.draft(), this.data()?.places ?? []),
  );
  protected readonly json = computed(() => submissionJson(this.submission()));
  protected readonly path = computed(() => inboxPath(this.submission()));

  protected readonly issues = computed<Issue[]>(() => {
    const options = this.data();
    return options ? issuesOf(this.submission(), options) : [];
  });
  /** The first message per field, for the forms, once the visitor asked to check. */
  protected readonly errors = computed<Partial<Record<string, string>>>(() => {
    if (!this.showIssues()) return {};
    const errors: Partial<Record<string, string>> = {};
    for (const issue of this.issues()) errors[issue.field] ??= issue.message;
    return errors;
  });

  constructor() {
    pageSeo({
      title: 'Add an event, a community or a podcast',
      description:
        'List your Angular event, community or podcast on Angular Hub: fill in the form, and GitHub opens a pull request with it.',
      path: '/contribute',
      image: '/og/contribute.png',
    });
  }

  /** GitHub's "new file" page with the entry filled in; committing it proposes the pull request. */
  protected openPullRequest(): void {
    this.showIssues.set(true);
    if (this.issues().length > 0) {
      // The first error, once the forms have rendered it.
      queueMicrotask(() =>
        this.document.querySelector<HTMLElement>('.hub-error')?.scrollIntoView({ block: 'center' }),
      );
      return;
    }
    this.document.defaultView?.open(pullRequestUrl(this.submission()), '_blank', 'noopener');
  }
}
