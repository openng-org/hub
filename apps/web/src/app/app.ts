import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { SiteHeader } from './core/layout/site-header';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet, SiteHeader],
  host: { class: 'flex min-h-screen flex-col' },
  template: `
    <hub-site-header />
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <router-outlet />
    </main>
    <footer class="border-t border-surface">
      <div
        class="mx-auto max-w-7xl px-4 py-6 text-sm text-muted flex flex-wrap items-center justify-between gap-2"
      >
        <span>Angular Hub — an OpenNG Foundation project. Code MIT, data CC BY 4.0.</span>
        <span class="flex flex-wrap gap-x-5 gap-y-1">
          <a routerLink="/about" class="link">About</a>
          <a
            href="https://github.com/openng-org/hub"
            target="_blank"
            rel="noopener noreferrer"
            class="link"
          >
            Contribute on GitHub
          </a>
        </span>
      </div>
    </footer>
  `,
})
export class App {}
