import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { pageSeo } from '../services/seo';
import { PageHeader } from '../layout/page-header';

/** /about — why the hub exists, as a personal note from its author. */
@Component({
  selector: 'hub-about-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeader],
  template: `
    <hub-page-header
      icon="pi pi-heart"
      eyebrow="A personal note"
      title="About"
      description="Understanding Angular does not have to be boring. Angular Hub was built with that idea in mind."
    />

    <article class="hub-about max-w-3xl space-y-5 text-lg leading-relaxed">
      <p class="flex items-center gap-2">
        <svg
          class="hub-about-wave"
          viewBox="0 0 11 12"
          role="img"
          aria-label="A pixel-art character waving"
          shape-rendering="crispEdges"
        >
          <defs>
            <linearGradient id="hub-wave-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#bf25b9" />
              <stop offset="0.5" stop-color="#836ae9" />
              <stop offset="1" stop-color="#1690fa" />
            </linearGradient>
          </defs>
          <g fill="url(#hub-wave-gradient)">
            <path
              d="M3 0h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM2 1h1v1h-1zM3 1h1v1h-1zM4 1h1v1h-1zM5 1h1v1h-1zM6 1h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM4 2h1v1h-1zM5 2h1v1h-1zM6 2h1v1h-1zM2 3h1v1h-1zM3 3h1v1h-1zM4 3h1v1h-1zM5 3h1v1h-1zM6 3h1v1h-1zM3 4h1v1h-1zM4 4h1v1h-1zM5 4h1v1h-1zM1 5h1v1h-1zM2 5h1v1h-1zM3 5h1v1h-1zM4 5h1v1h-1zM5 5h1v1h-1zM6 5h1v1h-1zM7 5h1v1h-1zM0 6h1v1h-1zM2 6h1v1h-1zM3 6h1v1h-1zM4 6h1v1h-1zM5 6h1v1h-1zM6 6h1v1h-1zM0 7h1v1h-1zM2 7h1v1h-1zM3 7h1v1h-1zM4 7h1v1h-1zM5 7h1v1h-1zM6 7h1v1h-1zM2 8h1v1h-1zM3 8h1v1h-1zM4 8h1v1h-1zM5 8h1v1h-1zM6 8h1v1h-1zM2 9h1v1h-1zM3 9h1v1h-1zM5 9h1v1h-1zM6 9h1v1h-1zM2 10h1v1h-1zM3 10h1v1h-1zM5 10h1v1h-1zM6 10h1v1h-1zM1 11h1v1h-1zM2 11h1v1h-1zM3 11h1v1h-1zM5 11h1v1h-1zM6 11h1v1h-1zM7 11h1v1h-1z"
            />
            <path class="hub-about-wave-a" d="M9 1h1v1h-1zM9 2h1v1h-1zM8 3h1v1h-1zM8 4h1v1h-1z" />
            <path class="hub-about-wave-b" d="M8 1h1v1h-1zM8 2h1v1h-1zM8 3h1v1h-1zM8 4h1v1h-1z" />
          </g>
        </svg>
        Hi, I'm Gerome
      </p>
      <p>
        I build Angular applications, I coach teams using it, and I spend quite a lot of my free
        time around the Angular community: organizing events, recording videos, answering questions
        in my DMs. Keeping up with Angular is part of all of this, and to be honest, it often felt
        like homework.
      </p>
      <p>
        The information is all there, just scattered: release notes to dig through, a changelog per
        package, a deprecation hidden in a commit message, a meetup I discovered the week after it
        happened. Reading it was rarely the fun part of my day.
      </p>

      <h2 class="hub-page-title text-4xl pt-4">It does not have to be boring</h2>
      <p>
        I don't think learning a framework should feel like reading a tax form. Understanding what
        changed in your tools can be as enjoyable as using them, and that's the mindset this project
        was created with: finding what you need should be quick, and a bit of fun along the way
        makes me want to come back. I hope it does for you too.
      </p>

      <h2 class="hub-page-title text-4xl pt-4">Tools I wish I had</h2>
      <p>
        Angular Hub is a collection of the tools I wish I had, that I ended up building for myself
        and decided to share publicly with the community:
      </p>
      <ul class="space-y-2 pl-1">
        <li>
          <a class="link font-medium" routerLink="/caniuse">Can I Use</a>
          <span class="text-muted">
            — is this feature stable in the version my project runs, and what replaces it?</span
          >
        </li>
        <li>
          <a class="link font-medium" routerLink="/releases">Release insights</a>
          <span class="text-muted">
            — what a major brought, without reading hundreds of commits first.</span
          >
        </li>
        <li>
          <a class="link font-medium" routerLink="/events">Events</a>,
          <a class="link font-medium" routerLink="/communities">communities</a> and
          <a class="link font-medium" routerLink="/podcasts">podcasts</a>
          <span class="text-muted"> — where Angular developers meet, near you or online.</span>
        </li>
      </ul>

      <h2 class="hub-page-title text-4xl pt-4">A companion to the official docs</h2>
      <p>
        Angular Hub is meant to complete the
        <a class="link" href="https://angular.dev" target="_blank" rel="noopener noreferrer"
          >official documentation</a
        >, not to replace it. angular.dev remains the reference, and you should keep it close. What
        you find here is my own point of view on how to learn and follow Angular: different angles,
        different formats, and pedagogical content I can adapt whenever I want, without waiting for
        anyone's approval.
      </p>

      <h2 class="hub-page-title text-4xl pt-4">Open source, on purpose</h2>
      <p>
        I have written quite a lot of blog posts, and I know their limits: most of them are one-shot
        content, true the day they are published and rarely updated after that. Angular moves fast,
        so an article about version 17 quietly becomes misleading by version 20.
      </p>
      <p>
        That's why this content lives in a repository instead: community-driven and community-
        maintained, free, and part of the
        <a
          class="link"
          href="https://github.com/openng-org"
          target="_blank"
          rel="noopener noreferrer"
          >OpenNG Foundation</a
        >. Every dataset is a JSON file anyone can improve: if your meetup is missing or a status
        looks wrong, <a class="link" routerLink="/contribute">add it from the site</a> or open a
        pull request on
        <a
          class="link"
          href="https://github.com/openng-org/hub"
          target="_blank"
          rel="noopener noreferrer"
          >GitHub</a
        >. That's how it stays accurate, for everyone.
      </p>

      <h2 class="hub-page-title text-4xl pt-4">What's next</h2>
      <p>
        To be honest, this project was first meant to grow into paid courses. I changed my mind: it
        now focuses only on open-source, free content for the community, and that's not going to
        change.
      </p>
      <p>
        New features will come either on demand, or to solve developer experience issues people have
        already shared with me about Angular. Feel free to propose your ideas, whether you
        <a
          class="link"
          href="https://github.com/openng-org/hub/issues"
          target="_blank"
          rel="noopener noreferrer"
          >open an issue</a
        >
        or directly make a contribution. Just keep in mind the goal: preserving the spirit of this
        project, and its own way to learn Angular.
      </p>
      <p>See you around, and have fun with Angular!</p>

      <footer class="hub-pixel-box flex items-center gap-4 mt-8! text-base">
        <span class="hub-about-avatar font-brand" aria-hidden="true">G</span>
        <span>
          <span class="block font-semibold">Gerome Grignon</span>
          <span class="block text-sm text-muted"
            >Creator of Angular Hub ·
            <a class="link" href="https://www.gerome.dev" target="_blank" rel="noopener noreferrer"
              >gerome.dev</a
            ></span
          >
        </span>
      </footer>
    </article>
  `,
})
export default class AboutPage {
  constructor() {
    pageSeo({
      title: 'About Angular Hub',
      description:
        'Understanding Angular does not have to be boring: a personal note from Gerome Grignon on why he built Angular Hub, the tools he wished he had, shared with the community.',
      path: '/about',
      image: '/og/about.png',
    });
  }
}
