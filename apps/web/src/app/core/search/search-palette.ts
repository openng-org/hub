import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';

import { SearchDialog } from './search-dialog';

/**
 * The site search entry point: a button in the header, plus Ctrl/⌘ K anywhere and "/" when not
 * typing in a field. The palette (dialog, results, API calls) is loaded the first time it opens,
 * so it costs nothing on pages where nobody searches.
 */
@Component({
  selector: 'hub-search-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchDialog],
  host: { class: 'contents' },
  template: `
    <button
      type="button"
      class="hub-search-trigger rounded-border inline-flex items-center gap-2 px-2.5 py-1.5 text-sm text-muted hover:bg-emphasis transition-colors"
      aria-label="Search the hub"
      aria-keyshortcuts="Control+K Meta+K"
      (click)="visible.set(true)"
    >
      <i class="pi pi-search" aria-hidden="true"></i>
      <span class="hidden md:inline">Search</span>
      <span class="hidden md:inline"
        ><kbd class="hub-kbd">{{ shortcut }}</kbd></span
      >
    </button>
    @defer (when visible()) {
      <hub-search-dialog [(visible)]="visible" />
    }
  `,
})
export class SearchPalette {
  private readonly document = inject(DOCUMENT);

  protected readonly visible = signal(false);
  protected readonly shortcut = this.isMac() ? '⌘K' : 'Ctrl K';

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const onKeydown = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement | null)?.closest(
        'input, textarea, select, [contenteditable="true"]',
      );
      if (
        (event.key === 'k' && (event.metaKey || event.ctrlKey)) ||
        (event.key === '/' && !typing)
      ) {
        event.preventDefault();
        this.visible.set(true);
      }
    };
    this.document.addEventListener('keydown', onKeydown);
    inject(DestroyRef).onDestroy(() => this.document.removeEventListener('keydown', onKeydown));
  }

  private isMac(): boolean {
    const nav = this.document.defaultView?.navigator;
    return !!nav && /Mac|iPhone|iPad/.test(nav.platform || nav.userAgent);
  }
}
