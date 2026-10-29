import { ChangeDetectionStrategy, Component, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';

import { pageSeo } from '../core/seo';

/**
 * The 404 page, for unknown URLs and for known routes whose id does not exist (a feature, a major).
 * On the server it also sets the HTTP status, so a missing page is a real 404 for crawlers and
 * monitoring, not a 200 that says "not found".
 */
@Component({
  selector: 'hub-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { class: 'flex flex-col items-center justify-center py-24 text-center' },
  template: `
    <p class="hub-wordmark text-5xl mb-2">404</p>
    <h1 class="hub-page-title text-4xl mb-3">Page not found</h1>
    <p class="text-muted mb-8 max-w-md">
      The page you are looking for does not exist or has moved.
    </p>
    <a class="hub-pixel-btn" routerLink="/">
      <span><i class="pi pi-home" aria-hidden="true"></i> Back to the home page</span>
    </a>
  `,
})
export default class NotFoundPage {
  constructor() {
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404;
    pageSeo({
      title: 'Page not found',
      description: 'The page you are looking for does not exist or has moved.',
      noindex: true,
    });
  }
}
