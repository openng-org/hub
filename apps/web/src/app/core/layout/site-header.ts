import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MegaMenuModule } from '@openng/optimus-ui/megamenu';
import { filter, map } from 'rxjs';

import { Theme } from '../theme/theme';
import { NAV_SECTIONS, type NavSection } from './nav';

import { SearchPalette } from '../search/search-palette';
@Component({
  selector: 'hub-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MegaMenuModule, SearchPalette],
  host: {
    class:
      'block relative z-50 border-b border-surface bg-surface-0/80 dark:bg-surface-950/80 backdrop-blur',
  },
  template: `
    <div class="mx-auto max-w-7xl px-4">
      <p-megamenu
        [model]="sections"
        ariaLabel="Main"
        scrollHeight="calc(100dvh - 5rem)"
        styleClass="hub-megamenu h-14 border-0! rounded-none! bg-transparent! px-0! gap-6!"
      >
        <ng-template #start>
          <a routerLink="/" class="flex items-center gap-3" aria-label="Angular Hub — home">
            <img src="/images/logo.webp" alt="" width="40" height="40" class="size-9" />
            <span
              class="hub-wordmark flex items-center gap-2 text-3xl leading-none"
              aria-hidden="true"
            >
              <span class="hidden md:inline">ANGULAR</span>
              <span>HUB</span>
            </span>
          </a>
        </ng-template>

        <ng-template #item let-item>
          @if (item.items) {
            <span class="p-megamenu-item-link text-sm" [class.text-primary]="isCurrent(item)">
              <i [class]="item.icon" aria-hidden="true"></i>
              {{ item.label }}
              <i class="pi pi-angle-down text-xs" aria-hidden="true"></i>
            </span>
          } @else {
            <a
              [routerLink]="item.routerLink"
              tabindex="-1"
              class="p-megamenu-item-link flex items-start gap-3 py-2.5! min-w-64"
            >
              <span
                class="hub-menu-icon size-9 shrink-0 grid place-items-center bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                aria-hidden="true"
              >
                <i [class]="item.icon"></i>
              </span>
              <span class="min-w-0">
                <span class="block font-medium">{{ item.label }}</span>
                <span class="block text-xs text-muted">{{ item.description }}</span>
              </span>
            </a>
          }
        </ng-template>

        <ng-template #end>
          <div class="flex items-center gap-1">
            <hub-search-palette />
            <button
              type="button"
              class="hub-theme-toggle size-9 rounded-border inline-grid place-items-center hover:bg-emphasis transition-colors"
              aria-label="Dark mode"
              [attr.aria-pressed]="theme.dark()"
              title="Toggle dark mode"
              (click)="theme.toggle()"
            >
              <i class="pi pi-moon hub-theme-light" aria-hidden="true"></i>
              <i class="pi pi-sun hub-theme-dark" aria-hidden="true"></i>
            </button>
            <a
              href="https://github.com/openng-org/hub"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-border px-3 py-1.5 text-sm hover:bg-emphasis transition-colors inline-flex items-center gap-2"
              aria-label="GitHub repository"
            >
              <i class="pi pi-github" aria-hidden="true"></i>
              <span class="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </ng-template>
      </p-megamenu>
    </div>
  `,
})
export class SiteHeader {
  private readonly router = inject(Router);
  protected readonly theme = inject(Theme);

  protected readonly sections = NAV_SECTIONS;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected isCurrent(section: NavSection): boolean {
    return new RegExp(`^${section.path}(/|\\?|$)`).test(this.url());
  }
}
