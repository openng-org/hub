import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { Dialog } from '@openng/optimus-ui/dialog';

import { apiUrl } from '../api/api.utils';
import type { SearchLink, SearchResults } from './search.model';
import { latestValue } from '../utils/query-params.utils';

const DEBOUNCE_MS = 150;

/** A row the arrow keys reach: a result, or a group's "See all". */
interface Option {
  id: string;
  link: SearchLink;
}

/**
 * The search palette itself, loaded the first time it opens (see SearchPalette): it searches every
 * dataset at once through /api/search, grouped by kind, each result saying where it lives. Arrow
 * keys move through the results, Enter opens one.
 */
@Component({
  selector: 'hub-search-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Dialog],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      appendTo="body"
      [dismissableMask]="true"
      [showHeader]="false"
      [draggable]="false"
      [resizable]="false"
      position="top"
      ariaLabelledBy="hub-search-label"
      styleClass="hub-search-dialog w-[min(42rem,calc(100vw-2rem))]"
      contentStyleClass="p-0!"
      (onShow)="focusInput()"
    >
      <div class="hub-search">
        <label id="hub-search-label" for="hub-search-input" class="sr-only">Search the hub</label>
        <div class="flex items-center gap-3 px-4 border-b border-surface">
          <i class="pi pi-search text-muted" aria-hidden="true"></i>
          <input
            #input
            id="hub-search-input"
            type="search"
            class="hub-search-input"
            placeholder="Features, migrations, events, communities…"
            autocomplete="off"
            spellcheck="false"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="hub-search-results"
            [attr.aria-expanded]="options().length > 0"
            [attr.aria-activedescendant]="activeId()"
            [ngModel]="text()"
            (ngModelChange)="type($event)"
            (keydown)="onKeydown($event)"
          />
          <kbd class="hub-kbd">Esc</kbd>
        </div>

        <!-- Focusable so the list scrolls from the keyboard too (axe: scrollable-region-focusable). -->
        <div
          class="hub-search-body"
          tabindex="0"
          aria-label="Search results"
          role="region"
          aria-live="polite"
        >
          @if (query().length < 2) {
            <p class="px-4 py-6 text-sm text-muted">
              Search every feature, ng update migration, MCP tool, ESLint rule, release, event,
              community and podcast at once.
            </p>
          } @else if (results.error()) {
            <p class="px-4 py-6 text-sm text-muted" role="alert">
              The search is unavailable right now. Try again in a moment.
            </p>
          } @else if (data(); as data) {
            @if (data.total === 0) {
              <p class="px-4 py-6 text-sm text-muted">Nothing matches “{{ text() }}”.</p>
            } @else {
              <div id="hub-search-results" role="listbox" aria-label="Results" class="py-2">
                @for (group of data.groups; track group.kind) {
                  <div role="group" [attr.aria-labelledby]="'hub-search-group-' + group.kind">
                    <div class="hub-search-group" [id]="'hub-search-group-' + group.kind">
                      <i [class]="group.icon" aria-hidden="true"></i>
                      {{ group.label }}
                    </div>
                    @for (result of group.items; track $index) {
                      @let id = 'hub-search-' + group.kind + '-' + $index;
                      <div
                        role="option"
                        class="hub-search-option"
                        [id]="id"
                        [attr.aria-selected]="id === activeId()"
                        tabindex="-1"
                        (mousemove)="activeId.set(id)"
                        (click)="go(result.link)"
                        (keydown.enter)="go(result.link)"
                      >
                        <span class="min-w-0 flex-1">
                          <span class="block truncate font-medium">{{ result.title }}</span>
                          @if (result.subtitle) {
                            <span class="block truncate text-xs text-muted">{{
                              result.subtitle
                            }}</span>
                          }
                        </span>
                        <span class="hub-search-where">
                          {{ result.where }}
                          @if (isExternal(result.link)) {
                            <i
                              class="pi pi-external-link text-[0.6rem]"
                              aria-label="opens a new tab"
                            ></i>
                          }
                        </span>
                      </div>
                    }
                    @if (group.more; as more) {
                      @let moreId = 'hub-search-' + group.kind + '-more';
                      <div
                        role="option"
                        class="hub-search-option hub-search-more"
                        [id]="moreId"
                        [attr.aria-selected]="moreId === activeId()"
                        tabindex="-1"
                        (mousemove)="activeId.set(moreId)"
                        (click)="go(more)"
                        (keydown.enter)="go(more)"
                      >
                        See all {{ group.total }} {{ group.label.toLowerCase() }}
                        <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          } @else {
            <p class="px-4 py-6 text-sm text-muted" aria-busy="true">Searching…</p>
          }
        </div>
        <div class="hub-search-footer">
          <span><kbd class="hub-kbd">↑</kbd> <kbd class="hub-kbd">↓</kbd> to move</span>
          <span><kbd class="hub-kbd">Enter</kbd> to open</span>
        </div>
      </div>
    </p-dialog>
  `,
})
export class SearchDialog {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly visible = model(false);
  /** What is typed; `query` follows it after a short pause. */
  protected readonly text = signal('');
  protected readonly query = signal('');
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected readonly results = httpResource<SearchResults>(() =>
    this.query().length >= 2 ? apiUrl('search', { q: this.query() }) : undefined,
  );
  protected readonly data = latestValue(this.results);

  /** Every result in display order, for the arrow keys. */
  protected readonly options = computed<Option[]>(() =>
    (this.data()?.groups ?? []).flatMap((group) => [
      ...group.items.map((result, index) => ({
        id: `hub-search-${group.kind}-${index}`,
        link: result.link,
      })),
      ...(group.more ? [{ id: `hub-search-${group.kind}-more`, link: group.more }] : []),
    ]),
  );
  /** The highlighted result: the first one after each new list. */
  protected readonly activeId = linkedSignal<Option[], string | null>({
    source: this.options,
    computation: (options) => options[0]?.id ?? null,
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      if (this.timer) clearTimeout(this.timer);
    });
    // A result (or the back button) navigates away: the palette closes.
    const navigation = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) this.visible.set(false);
    });
    destroyRef.onDestroy(() => navigation.unsubscribe());
  }

  protected focusInput(): void {
    const input = this.input()?.nativeElement;
    input?.focus();
    input?.select();
  }

  protected type(value: string): void {
    this.text.set(value);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.query.set(value.trim()), DEBOUNCE_MS);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const options = this.options();
    const index = options.findIndex((option) => option.id === this.activeId());
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (options.length === 0) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = options[(index + step + options.length) % options.length]!;
      this.activeId.set(next.id);
      this.document.getElementById(next.id)?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      const option = options[index];
      if (option) {
        event.preventDefault();
        this.go(option.link);
      }
    }
  }

  protected isExternal(link: SearchLink): boolean {
    return 'href' in link;
  }

  protected go(link: SearchLink): void {
    if ('href' in link) {
      this.document.defaultView?.open(link.href, '_blank', 'noopener');
      return;
    }
    this.visible.set(false);
    void this.router.navigate(link.path, { queryParams: link.queryParams ?? {} });
  }
}
