import { Injectable } from '@angular/core';
import type { SupportStatus } from '@openng/core-angular-versions';

import { ApiClient } from '../core/api-client';

export type { SupportStatus };

/** One number of the home page scoreboard, with the page it leads to. */
export interface HomeStat {
  value: string;
  label: string;
  link: string[];
}

/** A stretch of a major's support window, in percent of the timeline axis. */
export interface TimelineSegment {
  kind: 'active' | 'lts';
  start: number;
  width: number;
  /** "Active until Jun 2027". */
  label: string;
}

/** Every Angular major on one axis, and the support windows of the supported ones. */
export interface ReleaseTimeline {
  /** Year ticks, in percent of the axis. */
  years: { label: string; offset: number }[];
  today: { offset: number; label: string };
  /** Oldest first. `lane` alternates the labels above and below the track. */
  majors: {
    major: number;
    label: string;
    released: string;
    releasedIso: string;
    status: SupportStatus;
    statusLabel: string;
    offset: number;
    lane: 0 | 1;
    link: string[] | null;
  }[];
  /** Majors still supported, oldest first. */
  supported: {
    major: number;
    label: string;
    status: SupportStatus;
    statusLabel: string;
    summary: string;
    segments: TimelineSegment[];
    link: string[] | null;
  }[];
  legend: { status: SupportStatus; label: string; count: number }[];
  source: string;
}

export interface HomeStats {
  stats: HomeStat[];
  timeline: ReleaseTimeline;
}

/** The home page's counters (`/api/home`, built in src/server/home.ts). */
@Injectable({ providedIn: 'root' })
export class HomeApi extends ApiClient {
  stats(): Promise<HomeStats> {
    return this.required(this.get<HomeStats>('home'));
  }
}
