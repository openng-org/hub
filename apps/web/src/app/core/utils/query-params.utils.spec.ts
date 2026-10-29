import { ApplicationRef, Component, resource, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  debouncedParam,
  injectQueryParams,
  latestValue,
  pagedResource,
  type QueryParams,
} from './query-params.utils';

@Component({ selector: 'hub-host', template: '' })
class Host {
  readonly params = injectQueryParams();
  readonly search = debouncedParam(this.params, 'search', 300);
}

async function setup(url: string) {
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: 'list', component: Host }])],
  });
  const harness = await RouterTestingHarness.create();
  const host = await harness.navigateByUrl(url, Host);
  const router = TestBed.inject(Router);
  /** Resolves once the navigation a `set()` started has ended. */
  const navigated = () =>
    firstValueFrom(router.events.pipe(filter((event) => event instanceof NavigationEnd)));
  return { host, router, navigated };
}

describe('injectQueryParams', () => {
  it('reads parameters as signals, empty when absent', async () => {
    const { host } = await setup('/list?search=ng&page=2');
    expect(host.params.get('search')()).toBe('ng');
    expect(host.params.get('page')()).toBe('2');
    expect(host.params.get('missing')()).toBe('');
  });

  it('sets one parameter keeping the others, and removes empty ones', async () => {
    const { host, router, navigated } = await setup('/list?search=ng&page=2');
    let done = navigated();
    host.params.set('search', 'signals');
    await done;
    expect(router.url).toBe('/list?search=signals&page=2');
    expect(host.params.get('search')()).toBe('signals');

    done = navigated();
    host.params.patch({ page: '', view: 'map' });
    await done;
    expect(router.url).toBe('/list?search=signals&view=map');
  });
});

describe('debouncedParam', () => {
  afterEach(() => vi.useRealTimers());

  it('updates the input at once and the URL after the delay', async () => {
    const { host, router, navigated } = await setup('/list');
    vi.useFakeTimers();
    host.search.set('si');
    host.search.set('sig');
    expect(host.search.input()).toBe('sig');
    expect(router.url).toBe('/list');
    const done = navigated();
    vi.advanceTimersByTime(300);
    vi.useRealTimers();
    await done;
    expect(router.url).toBe('/list?search=sig');
    expect(host.search.input()).toBe('sig');
  });

  it('clears the parameter immediately when the box is emptied', async () => {
    const { host, router, navigated } = await setup('/list?search=ng');
    const done = navigated();
    host.search.set('');
    await done;
    expect(router.url).toBe('/list');
    expect(host.search.input()).toBe('');
  });

  it('follows the URL when it changes elsewhere (back button)', async () => {
    const { host, router } = await setup('/list?search=ng');
    await router.navigateByUrl('/list?search=other');
    expect(host.search.input()).toBe('other');
  });
});

interface Page {
  items: string[];
  page: number;
  pageCount: number;
}

const pageOf = (query: string, page: number): Page => ({
  items: [`${query}${page}`],
  page,
  pageCount: 3,
});

describe('latestValue and pagedResource', () => {
  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  it('keeps the previous value while loading and when a load fails', async () => {
    const query = signal('a');
    const { list, latest } = TestBed.runInInjectionContext(() => {
      const list = resource({
        params: query,
        loader: async ({ params }) => {
          if (params === 'boom') throw new Error('boom');
          return pageOf(params, 1);
        },
      });
      return { list, latest: latestValue(list) };
    });
    expect(latest()).toBeUndefined();
    await settle();
    expect(latest()?.items).toEqual(['a1']);
    query.set('boom');
    await settle();
    expect(list.error()).toBeInstanceOf(Error);
    expect(latest()?.items).toEqual(['a1']);
  });

  it('appends pages for the current query and starts over when it changes', async () => {
    const query = signal('a');
    let pending: ((page: Page) => void) | null = null;
    const pages = TestBed.runInInjectionContext(() => {
      const list = resource({ params: query, loader: async ({ params }) => pageOf(params, 1) });
      return pagedResource(
        list,
        (page) =>
          page === 3
            ? new Promise<Page>((resolve) => (pending = resolve))
            : Promise.resolve(pageOf(query(), page)),
        (page) => page.items,
      );
    });
    await settle();
    expect(pages.items()).toEqual(['a1']);
    expect(pages.hasMore()).toBe(true);

    await pages.loadMore();
    expect(pages.items()).toEqual(['a1', 'a2']);
    expect(pages.pagesLoaded()).toBe(2);

    // Page 3 is still loading when the query changes: its answer is dropped.
    const late = pages.loadMore();
    expect(pages.loading()).toBe(true);
    query.set('b');
    await settle();
    pending!(pageOf('a', 3));
    await late;
    expect(pages.items()).toEqual(['b1']);
    expect(pages.pagesLoaded()).toBe(1);
    expect(pages.loading()).toBe(false);
  });

  it('exposes a failed "load more" and lets the next attempt clear it', async () => {
    const query = signal('a');
    let fail = true;
    const pages = TestBed.runInInjectionContext(() => {
      const list = resource({ params: query, loader: async ({ params }) => pageOf(params, 1) });
      return pagedResource(
        list,
        (page) =>
          fail ? Promise.reject(new Error('offline')) : Promise.resolve(pageOf('a', page)),
        (page) => page.items,
      );
    });
    await settle();
    await pages.loadMore();
    expect(pages.error()).toBeInstanceOf(Error);
    expect(pages.items()).toEqual(['a1']);
    fail = false;
    await pages.loadMore();
    expect(pages.error()).toBeNull();
    expect(pages.items()).toEqual(['a1', 'a2']);
  });
});

// Type-level check: the interface is what the pages program against.
const _check: QueryParams | null = null;
void _check;
