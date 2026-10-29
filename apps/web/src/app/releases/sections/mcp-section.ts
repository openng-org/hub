import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TagModule } from '@openng/optimus-ui/tag';

import { latestValue } from '../../core/query-params';
import { EmptyState } from '../../ui/empty-state';
import { LoadError } from '../../ui/load-error';
import { Loading } from '../../ui/loading';
import { StatusPill } from '../../ui/status-pill';
import { ReleasesApi } from '../data/releases-api';
import { SectionHeader } from '../ui/section-header';

/** /releases/:version/mcp — tools and resources the Angular MCP server gained in the major. */
@Component({
  selector: 'hub-mcp-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TagModule, EmptyState, LoadError, Loading, SectionHeader, StatusPill],
  template: `
    @if (list.error()) {
      <hub-load-error what="the MCP server features" (retry)="list.reload()" />
    } @else if (data(); as list) {
      <hub-section-header
        title="MCP server"
        [count]="list.items.length"
        [description]="
          'Tools and resources the Angular MCP server gained in Angular ' + list.major + '.'
        "
      />
      @if (list.items.length === 0) {
        <hub-empty-state
          title="Nothing new"
          [message]="
            list.unavailableNote ??
            'The MCP server gained no tool or resource in Angular ' + list.major + '.'
          "
        />
      } @else {
        <ul class="grid gap-4 md:grid-cols-2">
          @for (item of list.items; track item.id) {
            <li class="rounded-border border border-surface p-4 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="font-mono font-medium">{{ item.name }}</span>
                <p-tag [value]="item.typeLabel" severity="secondary" />
                <hub-status-pill [status]="item.status" class="ml-auto" />
              </div>
              <p class="text-sm text-muted">{{ item.description }}</p>
            </li>
          }
        </ul>
      }
      <a routerLink="/caniuse/mcp" class="link text-sm inline-block mt-6"
        >The MCP server in every version →</a
      >
    } @else {
      <hub-loading height="6rem" [rows]="2" label="Loading MCP server features" />
    }
  `,
})
export default class McpSection {
  readonly version = input.required<string>();

  private readonly api = inject(ReleasesApi);

  protected readonly list = resource({
    params: computed(() => Number(this.version())),
    loader: ({ params }) => this.api.mcp(params),
  });
  protected readonly data = latestValue(this.list);
}
