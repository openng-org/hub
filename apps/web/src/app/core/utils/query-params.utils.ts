import {
  computed,
  DestroyRef,
  inject,
  linkedSignal,
  signal,
  type ResourceRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

export interface QueryParams {
  /** A query parameter as a signal, `''` when absent. */
  get(name: string): Signal<string>;
  /** Sets one parameter (an empty value removes it), keeping the others; replaces the history entry. */
  set(name: string, value: string): void;
  /** Sets several parameters at once (empty values remove them). */
  patch(values: Record<string, string>): void;
}

/** URL-backed filters for a routed component (call in an injection context). */
export function injectQueryParams(): QueryParams {
  const route = inject(ActivatedRoute);
  const router = inject(Router);
  const params = toSignal(route.queryParamMap, { initialValue: route.snapshot.queryParamMap });
  const patch = (values: Record<string, string>) =>
    void router.navigate([], {
      relativeTo: route,
      queryParams: Object.fromEntries(
        Object.entries(values).map(([name, value]) => [name, value || null]),
      ),
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  return {
    get: (name) => computed(() => params().get(name) ?? ''),
    set: (name, value) => patch({ [name]: value }),
    patch,
  };
}

export interface DebouncedParam {
  /** What the user is typing; the URL follows after the delay. */
  input: WritableSignal<string>;
  set(value: string): void;
}

/**
 * A search box bound to a query parameter: the input updates at once, the URL (and so the API
 * queries keyed on it) after `delay` ms, or immediately when the box is emptied. Call in an
 * injection context: the pending timer is cleared with the component.
 */
export function debouncedParam(params: QueryParams, name: string, delay = 300): DebouncedParam {
  const value = params.get(name);
  const input = linkedSignal(() => value());
  let timer: ReturnType<typeof setTimeout> | null = null;
  inject(DestroyRef).onDestroy(() => {
    if (timer) clearTimeout(timer);
  });
  return {
    input,
    set(next) {
      input.set(next);
      if (timer) clearTimeout(timer);
      if (next === '') {
        params.set(name, '');
        return;
      }
      timer = setTimeout(() => params.set(name, next), delay);
    },
  };
}

/**
 * A resource's latest value: kept while the next one loads (so changing a filter does not flash
 * the loading state) and when a load fails (the page shows the error next to it). `undefined`
 * until the first value arrives.
 */
export function latestValue<T>(view: ResourceRef<T | undefined>): Signal<T | undefined> {
  return linkedSignal<T | undefined, T | undefined>({
    source: () => (view.hasValue() ? view.value() : undefined),
    computation: (next, previous) => next ?? previous?.value,
  });
}

export interface Paged {
  page: number;
  pageCount: number;
}

export interface PagedResource<T> {
  /** Every item loaded so far: the first page's, then those fetched on demand. */
  items: Signal<T[]>;
  pagesLoaded: Signal<number>;
  hasMore: Signal<boolean>;
  loading: Signal<boolean>;
  /** The error of the last "load more", cleared by the next attempt. */
  error: Signal<unknown>;
  loadMore(): Promise<void>;
}

/**
 * "Load more" over a paged API view: the resource holds the first page for the current query,
 * further pages are fetched on demand and dropped when the query changes. A page that arrives
 * after the query changed is ignored. `select` names the page's list (`items` by default).
 */
export function pagedResource<P extends Paged, T>(
  first: ResourceRef<P | undefined>,
  loadPage: (page: number) => Promise<P>,
  select: (page: P) => T[],
): PagedResource<T> {
  const current = latestValue(first);
  const more = linkedSignal<P | undefined, T[][]>({
    source: current,
    computation: () => [],
  });
  const loading = signal(false);
  const error = signal<unknown>(null);
  const pagesLoaded = computed(() => 1 + more().length);
  return {
    items: computed(() => {
      const base = current();
      return [...(base ? select(base) : []), ...more().flat()];
    }),
    pagesLoaded,
    hasMore: computed(() => pagesLoaded() < (current()?.pageCount ?? 1)),
    loading,
    error,
    async loadMore() {
      const base = current();
      if (!base || loading() || pagesLoaded() >= base.pageCount) return;
      loading.set(true);
      error.set(null);
      try {
        const next = await loadPage(pagesLoaded() + 1);
        if (current() === base) more.update((pages) => [...pages, select(next)]);
      } catch (cause) {
        error.set(cause);
      } finally {
        loading.set(false);
      }
    },
  };
}
