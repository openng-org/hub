import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Tag } from '@openng/optimus-ui/tag';

import { apiUrl } from '../../../../../core/api/api.utils';
import type { ReleaseChangelogs } from '../../../releases.model';
import { injectQueryParams, latestValue } from '../../../../../core/utils/query-params.utils';
import { ChipFilter } from '../../../../../shared/components/chip-filter';
import { LoadError } from '../../../../../shared/components/load-error';
import { Loading } from '../../../../../shared/components/loading';
import type { TagSeverity } from '../../../../../shared/utils/status.utils';
import type { ReleaseChannel } from '../../../releases.model';
import { SectionHeader } from '../../../components/section-header';

const CHANNEL_SEVERITY: Record<ReleaseChannel, TagSeverity> = {
  stable: 'success',
  rc: 'info',
  next: 'secondary',
};

/** /releases/:version/changelogs — GitHub release notes per version (?channel= stable by default). */
@Component({
  selector: 'hub-changelogs-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Tag, ChipFilter, LoadError, Loading, SectionHeader],
  template: `
    @if (list.error()) {
      <hub-load-error what="the changelogs" (retry)="list.reload()" />
    } @else if (data(); as list) {
      <hub-section-header
        title="Changelogs"
        [description]="
          'Release notes of every Angular ' +
          list.major +
          ' release on GitHub, for angular and angular-cli.'
        "
      >
        <hub-chip-filter
          class="mt-4"
          label="Release channel"
          [options]="list.channels"
          [value]="channel() || 'stable'"
          (valueChange)="params.set('channel', $event === 'stable' ? '' : $event)"
        />
      </hub-section-header>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-muted border-b border-surface">
              <th class="py-2 pr-4 font-medium">Version</th>
              <th class="py-2 pr-4 font-medium">Channel</th>
              <th class="py-2 pr-4 font-medium">Released</th>
              <th class="py-2 font-medium">Release notes</th>
            </tr>
          </thead>
          <tbody>
            @for (row of list.items; track row.version) {
              <tr class="border-b border-surface">
                <td class="py-2.5 pr-4 font-mono font-medium">{{ row.version }}</td>
                <td class="py-2.5 pr-4">
                  <p-tag [value]="row.channelLabel" [severity]="severity[row.channel]" />
                </td>
                <td class="py-2.5 pr-4 whitespace-nowrap text-muted">{{ row.date }}</td>
                <td class="py-2.5">
                  <div class="flex flex-wrap gap-x-4 gap-y-1">
                    @for (link of row.links; track link.url) {
                      <a
                        class="link font-mono inline-flex items-center gap-1"
                        [href]="link.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        >{{ link.repository }}
                        <i class="pi pi-external-link text-[0.6rem]" aria-hidden="true"></i
                      ></a>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <hub-loading height="2.5rem" [rows]="3" label="Loading changelogs" />
    }
  `,
})
export default class ChangelogsSection {
  readonly version = input.required<string>();

  protected readonly params = injectQueryParams();
  protected readonly channel = this.params.get('channel');
  protected readonly severity = CHANNEL_SEVERITY;

  protected readonly list = httpResource<ReleaseChangelogs>(() =>
    apiUrl(`releases/${Number(this.version())}/changelogs`, { channel: this.channel() }),
  );
  protected readonly data = latestValue(this.list);
}
