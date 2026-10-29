import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  contentChild,
  input,
} from '@angular/core';

import type { CellGlyph, MatrixCell } from '../caniuse.model';
import { DelegatedTooltip } from '../directives/delegated-tooltip';
import { STATUS_COLORS, STATUS_ICONS } from '../../../shared/utils/status.utils';

/** A leading (non-version) column of the table. */
export interface StatusMatrixColumn {
  key: string;
  header: string;
  /** Classes for the header cell (width, alignment). */
  class?: string;
}

/** Template context for the projected leading cells (`let-item`). */
export interface StatusMatrixItemContext<T> {
  $implicit: T;
}

/**
 * Items × Angular majors, one status glyph per cell, as the API computed them (`cells`). A single
 * `<table>`: wide screens read it as a table, narrow ones as a card per row (see `.hub-matrix` in
 * styles/caniuse.css). One delegated tooltip serves every glyph; cells carry data attributes only.
 *
 * Project `<ng-template #cells let-item>` with the leading `<td>`s of a row.
 */
@Component({
  selector: 'hub-status-matrix-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, DelegatedTooltip],
  host: { class: 'block' },
  template: `
    <table class="hub-matrix w-full" hubDelegatedTooltip>
      <thead>
        <tr>
          @for (column of columns(); track column.key) {
            <th [class]="column.class ?? ''">{{ column.header }}</th>
          }
          @for (major of majors(); track major) {
            <th class="hub-matrix-major">{{ major }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (item of items(); track item.id) {
          <tr>
            <ng-container *ngTemplateOutlet="cells(); context: { $implicit: item }" />
            @for (cell of item.cells; track cell.major) {
              <td [attr.data-label]="cell.major">
                @switch (cell.kind) {
                  @case ('statuses') {
                    @for (glyph of glyphs(cell); track glyph.version) {
                      @if (glyph.minor) {
                        <span
                          class="hub-chip"
                          [class]="chipClasses(glyph)"
                          role="img"
                          [attr.aria-label]="glyph.label"
                          data-tip="status"
                          [attr.data-s]="glyph.status"
                          [attr.data-v]="glyph.version"
                        >
                          <i [class]="icons[glyph.status]" aria-hidden="true"></i
                          ><span class="hub-chip-version text-color">{{ glyph.version }}</span>
                        </span>
                      } @else {
                        <i
                          class="hub-glyph"
                          [class]="icons[glyph.status] + ' ' + colors[glyph.status].text"
                          role="img"
                          [attr.aria-label]="glyph.label"
                          data-tip="status"
                          [attr.data-s]="glyph.status"
                          [attr.data-v]="glyph.version"
                        ></i>
                      }
                    }
                  }
                  @case ('upcoming') {
                    <i
                      class="hub-glyph pi pi-clock text-status-upcoming"
                      role="img"
                      [attr.aria-label]="'Upcoming in version ' + cell.major"
                      data-tip="upcoming"
                      [attr.data-v]="cell.major"
                    ></i>
                  }
                  @default {
                    <span
                      class="hub-dot"
                      role="img"
                      [attr.aria-label]="'Not available in version ' + cell.major"
                      data-tip="none"
                      [attr.data-v]="cell.major"
                    ></span>
                  }
                }
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class StatusMatrixTable<T extends { id: string; cells: MatrixCell[] }> {
  readonly items = input.required<T[]>();
  /** Column headers, newest first (from the API, like the cells). */
  readonly majors = input.required<string[]>();
  readonly columns = input.required<StatusMatrixColumn[]>();

  protected readonly cells =
    contentChild.required<TemplateRef<StatusMatrixItemContext<T>>>('cells');

  protected readonly icons = STATUS_ICONS;
  protected readonly colors = STATUS_COLORS;

  protected glyphs(cell: MatrixCell): CellGlyph[] {
    return cell.kind === 'statuses' ? cell.glyphs : [];
  }

  protected chipClasses(glyph: CellGlyph): string {
    // The icon takes the status colour; the version stays in the body colour for contrast.
    return STATUS_COLORS[glyph.status].text;
  }
}
