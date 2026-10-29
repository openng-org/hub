import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

const STORAGE_KEY = 'hub-theme';
const DARK_CLASS = 'hub-dark';

/**
 * Light or dark: a class on <html>. index.html sets it before the first paint (no flash); this
 * service keeps it in sync afterwards. Until the visitor picks one with the toggle, the site follows
 * the OS setting, live; their choice is then saved in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly root = inject(DOCUMENT).documentElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Always false during SSR: the toggle draws both icons and CSS shows the right one. */
  readonly dark = signal(false);

  constructor() {
    if (!this.isBrowser) return;
    this.dark.set(this.root.classList.contains(DARK_CLASS));
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const followSystem = (event: MediaQueryListEvent) => {
      if (!this.stored()) this.apply(event.matches);
    };
    media.addEventListener('change', followSystem);
    inject(DestroyRef).onDestroy(() => media.removeEventListener('change', followSystem));
  }

  toggle(): void {
    const dark = !this.dark();
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    } catch {
      // Private mode or storage blocked: the choice lasts until the page is left.
    }
    this.apply(dark);
  }

  private apply(dark: boolean): void {
    this.root.classList.toggle(DARK_CLASS, dark);
    this.dark.set(dark);
  }

  private stored(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
