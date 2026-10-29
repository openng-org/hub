import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { apiUrl } from '../../../core/api/api.utils';
import { latestValue } from '../../../core/utils/query-params.utils';
import { LoadError } from '../../../shared/components/load-error';
import { Loading } from '../../../shared/components/loading';
import type { ReleaseTimeline as Timeline } from '../release-timeline.model';
import { ReleaseTimelineChart } from './release-timeline-chart';

/**
 * The release timeline, self-contained: it loads its own data (`/api/releases/timeline`) and shows
 * the loading and error states; drop it on any page.
 */
@Component({
  selector: 'hub-release-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadError, Loading, ReleaseTimelineChart],
  host: { class: 'block' },
  template: `
    @if (timeline.error()) {
      <hub-load-error what="the timeline" (retry)="timeline.reload()" />
    } @else if (data(); as data) {
      <hub-release-timeline-chart [timeline]="data" />
    } @else {
      <hub-loading [rows]="1" height="14rem" label="Loading the timeline" />
    }
  `,
})
export class ReleaseTimeline {
  protected readonly timeline = httpResource<Timeline>(() => apiUrl('releases/timeline'));
  protected readonly data = latestValue(this.timeline);
}
