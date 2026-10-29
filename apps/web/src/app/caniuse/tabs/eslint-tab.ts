import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from '@openng/optimus-ui/select';
import { TagModule } from '@openng/optimus-ui/tag';

import { injectQueryParams, latestValue } from '../../core/query-params';
import { EmptyState } from '../../ui/empty-state';
import { LoadError } from '../../ui/load-error';
import { Loading } from '../../ui/loading';
import type { EslintRuleType } from '../data/api';
import { CaniuseApi } from '../data/caniuse-api';

const TYPE_OPTIONS: { label: string; value: EslintRuleType | '' }[] = [
  { label: 'All types', value: '' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'HTML', value: 'html' },
];

/** angular-eslint rules with the version that introduced them; the API filters them (?type=). */
@Component({
  selector: 'hub-eslint-tab',
  // Same inset as the Features tab: the panels have no padding, each tab pads itself.
  host: { class: 'block px-6 pb-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, SelectModule, TagModule, EmptyState, LoadError, Loading],
  template: `
    <div class="filter-bar mb-4 flex items-center gap-2 flex-wrap">
      <p-select
        ariaLabel="Filter by type"
        [options]="typeOptions"
        optionLabel="label"
        optionValue="value"
        [ngModel]="typeFilter()"
        (onChange)="params.set('type', $event.value ?? '')"
        styleClass="w-44"
      />
    </div>

    @if (list.error()) {
      <hub-load-error class="py-8" what="the ESLint rules" (retry)="list.reload()" />
    } @else if (data(); as list) {
      @if (list.total === 0) {
        <hub-empty-state
          class="py-8"
          icon="pi pi-search"
          title="No rules found"
          message="Try adjusting your search or the type filter."
        />
      } @else {
        <table class="hub-table hub-table-responsive w-full">
          <thead>
            <tr>
              <th class="w-[340px]">Rule Name</th>
              <th>Description</th>
              <th class="w-[120px]">Type</th>
              <th class="w-[100px]">Version</th>
              <th class="w-[60px]"><span class="sr-only">Documentation</span></th>
            </tr>
          </thead>
          <tbody>
            @for (rule of list.items; track rule.name) {
              <tr>
                <td class="font-mono text-sm break-all">{{ rule.name }}</td>
                <td class="text-sm text-muted" data-label="Description">{{ rule.description }}</td>
                <td data-label="Type">
                  <p-tag [value]="rule.typeLabel" severity="secondary" />
                </td>
                <td class="font-mono text-sm whitespace-nowrap" data-label="Version">
                  {{ rule.version }}
                </td>
                <td data-label="Docs">
                  <a
                    [href]="rule.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link inline-flex items-center gap-1 text-sm"
                    [attr.aria-label]="'View documentation for ' + rule.name"
                  >
                    <i class="pi pi-external-link" aria-hidden="true"></i>
                    <span class="md:sr-only">Documentation</span>
                  </a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    } @else {
      <hub-loading class="py-4" height="2.5rem" label="Loading ESLint rules" />
    }
  `,
})
export class EslintTab {
  readonly search = input('');

  private readonly api = inject(CaniuseApi);
  protected readonly params = injectQueryParams();

  protected readonly typeOptions = TYPE_OPTIONS;
  /** URL-backed like the other filters, so a filtered list can be linked. */
  protected readonly typeFilter = computed<EslintRuleType | ''>(() => {
    const type = this.params.get('type')();
    return type === 'typescript' || type === 'html' ? type : '';
  });

  protected readonly list = resource({
    params: computed(() => ({ search: this.search(), type: this.typeFilter() })),
    loader: ({ params }) => this.api.eslint(params),
  });
  protected readonly data = latestValue(this.list);
}
