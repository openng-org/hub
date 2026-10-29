import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { httpResource } from '@angular/common/http';

import { apiUrl } from '../../../../../core/api/api.utils';
import type { McpList } from '../../../caniuse.model';
import { latestValue } from '../../../../../core/utils/query-params.utils';
import { EmptyState } from '../../../../../shared/components/empty-state';
import { LoadError } from '../../../../../shared/components/load-error';
import { Loading } from '../../../../../shared/components/loading';
import { MCP_STATUS_LEGEND_ITEMS } from '../../../../../shared/utils/status.utils';
import { StatusLegend } from '../../../components/status-legend';
import {
  StatusMatrixTable,
  type StatusMatrixColumn,
} from '../../../components/status-matrix-table';

const COLUMNS: StatusMatrixColumn[] = [
  { key: 'feature', header: 'Feature', class: 'w-1/5' },
  { key: 'type', header: 'Type', class: 'w-1/5' },
  { key: 'description', header: 'Description', class: 'w-2/5' },
];

/** Tools and resources of the official Angular MCP server, per Angular major. */
@Component({
  selector: 'hub-mcp-tab',
  // Same inset as the Features tab: the panels have no padding, each tab pads itself.
  host: { class: 'block px-6 pb-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, LoadError, Loading, StatusLegend, StatusMatrixTable],
  template: `
    <hub-status-legend [items]="legendItems" gridClass="lg:grid-cols-2" class="mb-4" />

    @if (list.error()) {
      <hub-load-error class="py-8" what="the MCP server features" (retry)="list.reload()" />
    } @else if (data(); as list) {
      @if (list.total === 0) {
        <hub-empty-state
          class="py-8"
          icon="pi pi-search"
          title="No MCP server features found"
          [message]="emptyMessage()"
          hint="Try adjusting your search terms."
        />
      } @else {
        <hub-status-matrix-table [items]="list.items" [majors]="list.majors" [columns]="columns">
          <ng-template #cells let-feature>
            <td class="font-medium">{{ feature.name }}</td>
            <td class="text-muted font-mono text-sm">{{ feature.type }}</td>
            <td class="text-sm text-muted max-w-xs">
              <span class="hub-clamp">{{ feature.description }}</span>
            </td>
          </ng-template>
        </hub-status-matrix-table>
      }
    } @else {
      <hub-loading class="py-4" height="2.5rem" label="Loading MCP features" />
    }
  `,
})
export class McpTab {
  readonly search = input('');

  protected readonly legendItems = MCP_STATUS_LEGEND_ITEMS;
  protected readonly columns = COLUMNS;

  protected readonly list = httpResource<McpList>(() =>
    apiUrl('caniuse/mcp', { search: this.search() }),
  );
  protected readonly data = latestValue(this.list);
  protected readonly emptyMessage = computed(
    () => `No MCP server features found matching "${this.search()}".`,
  );
}
