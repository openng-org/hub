import { Injectable } from '@angular/core';

import { ApiClient } from '../../core/api/api-client';
import type {
  CommunityList,
  ContributeOptions,
  CommunityQuery,
  EventList,
  EventMap,
  EventQuery,
  PodcastList,
} from './community.model';

/** Events, communities and podcasts as the UI sees them (see api.ts). */
@Injectable({ providedIn: 'root' })
export class CommunityApi extends ApiClient {
  events(query: EventQuery): Promise<EventList> {
    return this.required(this.get<EventList>('community/events', { ...query }));
  }

  eventMap(query: EventQuery): Promise<EventMap> {
    return this.required(this.get<EventMap>('community/events/map', { ...query }));
  }

  contributeOptions(): Promise<ContributeOptions> {
    return this.required(this.get<ContributeOptions>('community/contribute'));
  }

  communities(query: CommunityQuery): Promise<CommunityList> {
    return this.required(this.get<CommunityList>('community/communities', { ...query }));
  }

  podcasts(): Promise<PodcastList> {
    return this.required(this.get<PodcastList>('community/podcasts', {}));
  }
}
