import type { HomeData } from '../app/features/home/home-api';
import { releaseTimeline } from './timeline';

/** The home page data: the release timeline, whose support statuses depend on today. */
export async function homeData(today?: string): Promise<HomeData> {
  return { timeline: releaseTimeline(today) };
}
