import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { escapeHtml, statusTooltip } from '../../../shared/utils/status.utils';

/**
 * One tooltip for a whole table: hover or focus any element carrying `data-tip` and a panel shows
 * next to it. Cells carry `data-tip="status|upcoming|none"` with `data-s`/`data-v`; a feature cell
 * carries `data-tip="feature"` and the text comes from its `.hub-feature-desc` child. Replaces
 * one tooltip directive instance per cell (hundreds) with four listeners and zero markup.
 * Browser-only by construction: host listeners never fire during SSR.
 */
@Directive({
  selector: '[hubDelegatedTooltip]',
  host: {
    '(mouseover)': 'show($event.target)',
    '(focusin)': 'show($event.target)',
    '(mouseout)': 'hide($event.target, $event.relatedTarget)',
    '(focusout)': 'hide($event.target, null)',
  },
})
export class DelegatedTooltip {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private panel: HTMLElement | null = null;
  private current: Element | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.panel?.remove());
  }

  protected show(target: EventTarget | null): void {
    const element = (target as Element | null)?.closest?.('[data-tip]') ?? null;
    if (!element || element === this.current) return;
    const html = this.content(element);
    if (!html) return;
    this.current = element;
    const panel = this.ensurePanel();
    panel.innerHTML = html;
    panel.style.visibility = 'hidden';
    panel.style.display = 'block';
    const rect = element.getBoundingClientRect();
    const width = panel.offsetWidth;
    const left = Math.min(
      Math.max(8, rect.left + rect.width / 2 - width / 2),
      this.document.documentElement.clientWidth - width - 8,
    );
    const top = rect.top - panel.offsetHeight - 8;
    panel.style.left = `${left}px`;
    panel.style.top = `${top < 8 ? rect.bottom + 8 : top}px`;
    panel.style.visibility = '';
  }

  protected hide(target: EventTarget | null, related: EventTarget | null): void {
    const element = (target as Element | null)?.closest?.('[data-tip]') ?? null;
    if (!element || element !== this.current) return;
    if (related instanceof Node && element.contains(related)) return;
    this.current = null;
    if (this.panel) this.panel.style.display = 'none';
  }

  private content(element: Element): string {
    const kind = element.getAttribute('data-tip') ?? '';
    if (kind === 'feature') {
      const description = element.querySelector('.hub-feature-desc')?.textContent?.trim();
      const status = element.getAttribute('data-s');
      const version = element.getAttribute('data-v');
      const parts: string[] = [];
      if (description) parts.push(`<p>${escapeHtml(description)}</p>`);
      if (status)
        parts.push(
          `<p class="text-xs mt-1"><strong>${escapeHtml(status)}</strong> (v${escapeHtml(version ?? '')})</p>`,
        );
      return parts.join('');
    }
    return statusTooltip(kind, element.getAttribute('data-s'), element.getAttribute('data-v'));
  }

  private ensurePanel(): HTMLElement {
    if (!this.panel) {
      this.panel = this.document.createElement('div');
      this.panel.className = 'hub-tooltip';
      this.panel.setAttribute('role', 'tooltip');
      this.host.nativeElement.ownerDocument.body.appendChild(this.panel);
    }
    return this.panel;
  }
}
