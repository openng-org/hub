export type FeatureStatus = {
  version: number;
  metadata?: FeatureMetadata;
  status: 'experimental' | 'preview' | 'stable' | 'deprecated' | 'removed' | null;
};

export type Feature = {
  id?: string;
  name: string;
  package?: string;
  metadata?: FeatureMetadata;
  versions: FeatureStatus[];
  children?: Feature[];
};

export type FeatureMetadata = {
  description?: string;
  notes?: string;
  migrationNotes?: string;
  links?: Link[];
  documentationUrl?: string;
  commitUrl?: string;
  rfcUrl?: string;
  referenceUrl?: string;
  replacedBy?: string;
  replacementUrl?: string;
  detailsUrl?: string;
  migrationScript?: string;
};

export type Link = {
  type: LinkType;
  url: string;
};

export enum LinkType {
  DOCUMENTATION,
  RFC,
  RFC_SUMMARY,
  PULL_REQUEST,
  COMMIT,
}

export const features: Feature[] = [
  {
    id: 'standalone-api',
    name: 'Standalone API',
    package: '@angular/core',
    metadata: {
      description:
        'Directly import other components, directives, and pipes used in their templates and enable some features such as defer, hostDirectives and loadComponent.',
      documentationUrl: 'https://angular.dev/guide/components/importing#standalone-components',
      rfcUrl: 'https://github.com/angular/angular/discussions/43784',
      migrationScript: 'ng generate @angular/core:standalone',
    },
    versions: [
      { version: 13, status: null },
      {
        version: 14,
        status: 'experimental',
        metadata: {
          commitUrl:
            'https://github.com/angular/angular/commit/5a10fc4f8287d448c88ce2f6c97c48307af34af1',
        },
      },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      {
        version: 19,
        status: 'stable',
        metadata: {
          notes:
            'Components, Directives and Pipes are now standalone by default - no need to specify `standalone: true` anymore',
        },
      },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'defer',
    name: '@defer',
    package: '@angular/core',
    metadata: {
      description:
        'Defer the loading of select dependencies such as components, directives, and pipes, and any associated CSS within a template',
      documentationUrl: 'https://angular.dev/guide/defer#',
      rfcUrl: 'https://github.com/angular/angular/discussions/50716',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: 'preview' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: '@for',
    name: '@for',
    package: '@angular/core',
    metadata: {
      description:
        'Angular templates support control flow blocks that let you conditionally repeat elements.',
      documentationUrl:
        'https://angular.dev/guide/templates/control-flow#repeat-content-with-the-for-block',
      rfcUrl: 'https://github.com/angular/angular/discussions/50719',
      migrationScript: 'ng generate @angular/core:control-flow',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      {
        version: 17,
        status: 'preview',
        metadata: {
          commitUrl:
            'https://github.com/angular/angular/commit/93675dc797cb9f897c19fe298455dec52b900113',
        },
      },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20,
        status: 'stable',
        metadata: {
          notes: 'ng update mandatory migration',
        },
      },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: '@switch',
    name: '@switch',
    package: '@angular/core',
    metadata: {
      description:
        'Angular templates support control flow blocks that let you conditionally show elements.',
      documentationUrl:
        'https://angular.dev/guide/templates/control-flow#conditionally-display-content-with-the-switch-block',
      rfcUrl: 'https://github.com/angular/angular/discussions/50719',
      migrationScript: 'ng generate @angular/core:control-flow',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      {
        version: 17,
        status: 'preview',
        metadata: {
          commitUrl:
            'https://github.com/angular/angular/commit/93675dc797cb9f897c19fe298455dec52b900113',
        },
      },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20,
        status: 'stable',
        metadata: {
          notes: 'ng update mandatory migration',
        },
      },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: '@if',
    name: '@if',
    package: '@angular/core',
    metadata: {
      description:
        'Angular templates support control flow blocks that let you conditionally show and hide elements.',
      documentationUrl:
        'https://angular.dev/guide/templates/control-flow#conditionally-display-content-with-if-else-if-and-else',
      rfcUrl: 'https://github.com/angular/angular/discussions/50719',
      migrationScript: 'ng generate @angular/core:control-flow',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      {
        version: 17,
        status: 'preview',
        metadata: {
          commitUrl:
            'https://github.com/angular/angular/commit/93675dc797cb9f897c19fe298455dec52b900113',
        },
      },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20,
        status: 'stable',
        metadata: {
          notes: 'ng update mandatory migration',
        },
      },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'functional-guards-resolvers',
    name: 'Functional guards/resolvers',
    package: '@angular/router',
    metadata: {
      description: 'Create guards and resolvers using functions.',
    },
    versions: [
      { version: 13, status: null },
      { version: 14.2, status: 'stable' },
      { version: 15, status: 'stable' },
      {
        version: 16,
        status: 'stable',
        metadata: {
          commitUrl:
            'https://github.com/angular/angular-cli/commit/22fdd7da97c832048410ca89622712d097490c5d',
        },
      },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'functional-interceptors',
    name: 'Functional interceptors',
    package: '@angular/router',
    metadata: {
      description: 'Create interceptors using functions.',
      documentationUrl: 'https://v18.angular.dev/guide/http/interceptors#',
    },
    versions: [
      { version: 13, status: null },
      { version: 14.2, status: null },
      {
        version: 15,
        status: 'stable',
        metadata: {
          commitUrl:
            'https://github.com/angular/angular/commit/62c7a7a16e035c3a5346270dc4c5c6de85bf9137',
        },
      },
      {
        version: 16,
        status: 'stable',
        metadata: {
          commitUrl:
            'https://github.com/angular/angular-cli/commit/22fdd7da97c832048410ca89622712d097490c5d',
        },
      },
      {
        version: 17,
        status: 'stable',
        metadata: {
          commitUrl:
            'https://github.com/angular/angular-cli/commit/a189962a515051fd77e20bf8dd1815086a0d12ef',
        },
      },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: '@let',
    name: '@let',
    package: '@angular/core',
    metadata: {
      description: 'Define a local variable and re-use it across the template.',
      documentationUrl:
        'https://angular.dev/guide/templates/variables#local-template-variables-with-let',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      {
        version: 18.1,
        status: 'preview',
        metadata: {
          commitUrl:
            'https://github.com/angular/angular/commit/0a48d584f2ffeebb9402032182d4fc13a260c5cf',
        },
      },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'signal-core',
    name: 'Signal (core)',
    package: '@angular/core',
    metadata: {
      description:
        'System that granularly tracks how and where your state is used throughout an application, allowing the framework to optimize rendering updates.',
      documentationUrl: 'https://angular.dev/guide/signals#',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'preview' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'signal-inputs',
    name: 'Signal inputs',
    package: '@angular/core',
    metadata: {
      description: 'Allow values to be bound from parent components.',
      documentationUrl: 'https://angular.dev/guide/signals/inputs#',
      migrationScript: 'ng generate @angular/core:signal-input-migration',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17.1, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'output',
    name: 'output()',
    package: '@angular/core',
    metadata: {
      description: 'Enable emitting values to parent directives and components.',
      documentationUrl: 'https://angular.dev/guide/components/outputs#',
      migrationScript: 'ng generate @angular/core:output-migration',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17.3, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'signal-queries',
    name: 'Signal queries',
    package: '@angular/core',
    metadata: {
      description:
        'Signals to retrieve references to child components, directives, DOM elements, and more.',
      documentationUrl: 'https://angular.dev/guide/signals/queries#',
      migrationScript: 'ng generate @angular/core:signal-queries-migration',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17.2, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'signal-model',
    name: 'Signal model',
    package: '@angular/core',
    metadata: {
      description:
        'Special type of input that enable a component to propagate new values back to another component.',
      documentationUrl: 'https://angular.dev/guide/signals/model',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17.2, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'signal-effect',
    name: 'Signal effect',
    package: '@angular/core',
    metadata: {
      description: 'Operation that runs whenever one or more signal values change.',
      documentationUrl: 'https://angular.dev/guide/signals#effects',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'preview' },
      { version: 17, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'preview' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'signal-inputs-converter',
    name: 'Signal inputs converter',
    metadata: {
      description:
        'Language service refactoring action that can convert `@Input()` declarations to signal inputs.',
    },
    package: '@angular/language-service',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/1f067f4507b6e908fe991d5de0dc4d3a627ab2f9',
            },
          ],
        },
      },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'withEventReplay',
    name: 'withEventReplay',
    package: '@angular/platform-browser',
    metadata: {
      description:
        'Support for replaying user events (e.g. clicks) that happened on a page before hydration logic has completed.',
      documentationUrl: 'https://angular.dev/guide/hydration#capturing-and-replaying-events',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: 'preview' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'provideZonelessChangeDetection',
    name: 'provideZonelessChangeDetection',
    package: '@angular/platform-browser',
    metadata: {
      description:
        'Provide change detection without ZoneJS for the application bootstrapped using bootstrapApplication.',
      documentationUrl:
        'https://angular.dev/guide/testing/components-scenarios#automatic-change-detection',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: 'experimental' },
      { version: 19, status: 'experimental' },
      {
        version: 20,
        status: 'preview',
        metadata: {
          notes: 'Renamed from provideExperimentalZoneChangeDetection',
        },
      },
      {
        version: 20.2,
        status: 'stable',
        metadata: {
          notes: 'Renamed from provideExperimentalZoneChangeDetection',
        },
      },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'withI18nSupport',
    name: 'withI18nSupport',
    package: '@angular/platform-browser',
    metadata: {
      description: 'Enable support for hydrating i18n blocks.',
      documentationUrl: 'https://angular.dev/guide/hydration#i18n',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: 'preview' },
      { version: 19, status: 'preview' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  // TODO Angular SSR API preview (https://github.com/angular/angular-cli/commit/bbc290133fc93186980ca3c43f221847ba8e858a)
  {
    id: 'createRequestHandler',
    name: 'createRequestHandler',
    metadata: {
      description:
        'Annotate a request handler function with metadata, marking it as a special handler.',
    },
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: 'preview' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'createNodeRequestHandler',
    name: 'createNodeRequestHandler',
    metadata: {
      description:
        'Attache metadata to the handler function to mark it as a special handler for Node.js environments.',
    },
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: 'preview' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'isMainModule',
    name: 'isMainModule',
    metadata: {
      description: 'Determine whether the provided URL represents the main entry point module.',
    },
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: 'preview' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'PendingTasks',
    name: 'PendingTasks',
    metadata: {
      description:
        'Experimental service that keeps track of pending tasks contributing to the stableness of Angular application.',
      documentationUrl:
        'https://angular.dev/guide/experimental/zoneless#experimentalpendingtasks-for-server-side-rendering-ssr',
    },
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: 'experimental' },
      { version: 19, status: 'preview' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'AngularAppEngine',
    name: 'AngularAppEngine',
    metadata: {
      description:
        'Manage Angular server applications (including localized ones), handles rendering requests, and optionally transforms index HTML before rendering.',
    },
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: 'preview' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'AngularNodeAppEngine',
    name: 'AngularNodeAppEngine',
    metadata: {
      description:
        'Manage Angular server applications (including localized ones), handles rendering requests, and optionally transforms index HTML before rendering.',
    },
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: 'preview' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'createWebRequestFromNodeRequest',
    name: 'createWebRequestFromNodeRequest',
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'preview',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular-cli/commit/455b5700c29845829235e17efec320e634553108#diff-c5d5f2d7a4d78d365d99bfe612bcd8043917786a814bb0c2b4df3ef21916636aR18',
            },
          ],
        },
      },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'writeResponseToNodeResponse',
    name: 'writeResponseToNodeResponse',
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'preview',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular-cli/commit/455b5700c29845829235e17efec320e634553108#diff-e9a8e11f8ba8e6179d9d2746330ebdb2900cba68f0be8e9d0f34ad952cb90e43R19',
            },
          ],
        },
      },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'RenderMode',
    name: 'RenderMode',
    metadata: {
      description: 'Different rendering modes for server routes.',
    },
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'preview',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular-cli/commit/41fb2ed86056306406832317178ca5d94aa110e2#diff-503e115eb1d0e9fe3ed1c908026bf21f1b853c0aaabcd54be2f464b8d12d4967R15',
            },
          ],
        },
      },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'PrerenderFallback',
    name: 'PrerenderFallback',
    metadata: {
      description: 'Fallback strategies for Static Site Generation (SSG) routes.',
    },
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'preview',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular-cli/commit/41fb2ed86056306406832317178ca5d94aa110e2#diff-503e115eb1d0e9fe3ed1c908026bf21f1b853c0aaabcd54be2f464b8d12d4967R33',
            },
          ],
        },
      },
      { version: 20, status: 'preview' },
      { version: 21, status: 'preview' },
      { version: 22, status: 'preview' },
    ],
  },
  {
    id: 'ServerRoute',
    name: 'ServerRoute',
    metadata: {
      description: 'Server route configuration.',
    },
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'preview',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular-cli/commit/41fb2ed86056306406832317178ca5d94aa110e2#diff-503e115eb1d0e9fe3ed1c908026bf21f1b853c0aaabcd54be2f464b8d12d4967R124',
            },
          ],
        },
      },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'provideServerRendering',
    name: 'provideServerRendering',
    metadata: {
      description: 'Configure the necessary providers for server routes configuration.',
    },
    package: '@angular/ssr',
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'preview',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular-cli/commit/41fb2ed86056306406832317178ca5d94aa110e2#diff-503e115eb1d0e9fe3ed1c908026bf21f1b853c0aaabcd54be2f464b8d12d4967R139',
            },
          ],
        },
      },
      {
        version: 20,
        status: 'stable',
        metadata: {
          notes: 'Renamed from provideServerRoutes',
        },
      },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'afterEveryRender',
    name: 'afterEveryRender',
    package: '@angular/core',
    metadata: {
      description: 'Register a callback to be invoked each time the application finishes rendering',
      documentationUrl:
        'https://angular.dev/guide/components/lifecycle#aftereveryrender-and-afternextrender',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'preview' },
      { version: 17, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'preview' },
      {
        version: 20,
        status: 'stable',
        metadata: {
          notes: 'Renamed from afterRender',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60999',
            },
          ],
        },
      },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'afterNextRender',
    name: 'afterNextRender',
    package: '@angular/core',
    metadata: {
      description:
        'Register callbacks to be invoked the next time the application finishes rendering',
      documentationUrl:
        'https://angular.dev/guide/components/lifecycle#aftereveryrender-and-afternextrender',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'preview' },
      { version: 17, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'preview' },
      {
        version: 20,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60792',
            },
          ],
        },
      },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'afterRenderEffect',
    name: 'afterRenderEffect',
    package: '@angular/core',
    metadata: {
      description: "Create effect(s) that run as part of Angular's `afterRender` sequence.",
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/be2e49639bda831831ad62d49253db942a83fd46#diff-74210fe93145cf1b95113524d1ca78287880b46bdb8f838930b1160ec7066e3eR263',
            },
          ],
        },
      },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'withViewTransitions',
    name: 'withViewTransitions',
    package: '@angular/router',
    metadata: {
      description: 'Enable view transitions in the Router',
      documentationUrl:
        'https://angular.dev/guide/animations/route-animations#how-the-router-uses-view-transitions',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      {
        version: 17,
        status: 'experimental',
        metadata: {
          commitUrl:
            'https://github.com/angular/angular/commit/73e4bf2ed2471faf44a49b591e19a390d5867449',
        },
      },
      { version: 18, status: 'experimental' },
      {
        version: 19,
        status: 'preview',
        metadata: {
          commitUrl:
            'https://github.com/angular/angular/pull/55600/commits/313c0b1502fcac069712e311866aba5c017ef585',
        },
      },
      { version: 20, status: 'preview' },
      { version: 21, status: 'preview' },
      { version: 22, status: 'preview' },
    ],
  },
  {
    id: 'toSignal',
    name: 'toSignal',
    package: '@angular/core/rxjs-interop',
    metadata: {
      description: 'Get the current value of an Observable as a reactive Signal.',
      documentationUrl: 'https://angular.dev/guide/signals/rxjs-interop#tosignal',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'preview' },
      { version: 17, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'preview' },
      {
        version: 20,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60442',
            },
          ],
        },
      },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'toObservable',
    name: 'toObservable',
    package: '@angular/core/rxjs-interop',
    metadata: {
      description: 'Expose the value of an Angular Signal as an RxJS Observable.',
      documentationUrl: 'https://angular.dev/guide/signals/rxjs-interop#toobservable',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'preview' },
      { version: 17, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'preview' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'takeUntilDestroyed',
    name: 'takeUntilDestroyed',
    package: '@angular/core/rxjs-interop',
    metadata: {
      description:
        'Complete the Observable when the calling context (component, directive, service, etc) is destroyed.',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'preview' },
      { version: 17, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'outputFromObservable',
    name: 'outputFromObservable',
    package: '@angular/core/rxjs-interop',
    metadata: {
      description:
        'Output using an RxJS observable as a source for events dispatched to parent subscribers.',
      documentationUrl: 'https://angular.dev/guide/signals/rxjs-interop#outputfromobservable',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'preview' },
      { version: 17, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'outputToObservable',
    name: 'outputToObservable',
    package: '@angular/core/rxjs-interop',
    metadata: {
      description:
        'Convert an Angular output declared via output() or outputFromObservable() to an observable.',
      documentationUrl: 'https://angular.dev/guide/signals/rxjs-interop#outputtoobservable',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'preview' },
      { version: 17, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'auto-csp',
    name: 'auto-csp',
    package: '@angular/build',
    metadata: {
      description: 'Opt-in option in angular.json to enable the auto-CSP transformation',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular-cli/commit/efb434136d8c8df207747ab8fd87b7e2116b7106',
            },
          ],
        },
      },
      { version: 20, status: 'preview' },
      { version: 21, status: 'preview' },
      { version: 22, status: 'preview' },
    ],
  },
  {
    id: 'experimentalPlatform',
    name: 'experimentalPlatform',
    package: '@angular/build',
    metadata: {
      description: 'Specifie the platform for which the server bundle is generated',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular-cli/commit/7d883a152e978112245a98f2f737764caa76ec0f',
            },
          ],
        },
      },
      { version: 20, status: 'experimental' },
      { version: 21, status: 'experimental' },
      { version: 22, status: 'experimental' },
    ],
  },
  {
    id: 'withIncrementalHydration',
    name: 'withIncrementalHydration',
    package: '@angular/platform-browser',
    metadata: {
      description: 'Enable support for incremental hydration using the `hydrate` trigger syntax.',
      documentationUrl:
        'https://angular.dev/guide/incremental-hydration#how-do-you-enable-incremental-hydration-in-angular',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'preview',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/69fc5ae9229b872a9ad70eb920087af2a378fead',
            },
          ],
        },
      },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'pendingUntilEvent',
    name: 'pendingUntilEvent',
    package: '@angular/core/rxjs-interop',
    metadata: {
      description:
        'Operator which makes the application unstable until the observable emits, complets, errors, or is unsubscribed.',
      documentationUrl:
        'https://angular.dev/guide/zoneless#pendingtasks-for-server-side-rendering-ssr',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/8ebbae88ca48b8aa78cd85deedbed19d44b8227e',
            },
          ],
        },
      },
      { version: 20, status: 'preview' },
      { version: 21, status: 'preview' },
      { version: 22, status: 'preview' },
    ],
  },
  {
    id: 'resource',
    name: 'resource()',
    package: '@angular/core',
    metadata: {
      description:
        'Construct a `Resource` that projects a reactive request to an asynchronous operation defined by a loader function, which exposes the result of the loading operation via signals.',
      documentationUrl: 'https://angular.dev/guide/signals/resource#',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/18d8d44b1f3d56a4eda68f2cafded7529e08d0f1',
            },
          ],
        },
      },
      { version: 20, status: 'experimental' },
      { version: 21, status: 'experimental' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'rxResource',
    name: 'rxResource()',
    package: '@angular/core/rxjs-interop',
    metadata: {
      description:
        'Construct a `Resource` that projects a reactive request to an asynchronous operation defined by a RxJS based loader function, which exposes the result of the loading operation via signals.',
      documentationUrl: 'https://angular.dev/guide/signals/resource#',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/9762b24b5e8d7ab3ed2321959492a77b01d8ae57',
            },
          ],
        },
      },
      { version: 20, status: 'experimental' },
      { version: 21, status: 'experimental' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'httpResource',
    name: 'httpResource()',
    package: '@angular/common/http',
    metadata: {
      description: 'new frontend to the HttpClient infrastructure',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19.2,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/59876/commits/8aec2dfb30d1b35bb3eb7bc46692525691c1a56c',
            },
          ],
        },
      },
      { version: 20, status: 'experimental' },
      { version: 21, status: 'experimental' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'linkedSignal',
    name: 'linkedSignal',
    package: '@angular/core',
    metadata: {
      description:
        'Represent state (hence the signal in the name) that is reset based on the provided computation.',
      documentationUrl: 'https://angular.dev/guide/signals/linked-signal#',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      {
        version: 19,
        status: 'preview',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/8311f00faaf282d1a5b1ddca29247a2fba94a692',
            },
          ],
        },
      },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'withRequestsMadeViaParent',
    name: 'withRequestsMadeViaParent',
    package: '@angular/common/http',
    metadata: {
      description:
        "Configure the current `HttpClient` instance to make requests via the parent injector's `HttpClient` instead of directly.",
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: 'preview' },
      { version: 16, status: 'preview' },
      { version: 17, status: 'preview' },
      { version: 18, status: 'preview' },
      {
        version: 19,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/4b9accdf166f3990b3706de83ada15937fe786e2',
            },
          ],
        },
      },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'ngOptimizedImage',
    name: 'ngOptimizedImage',
    package: '@angular/common',
    metadata: {
      description: 'Directive that improves image loading performance by enforcing best practices.',
      documentationUrl: 'https://angular.dev/guide/image-optimization',
    },
    versions: [
      { version: 13, status: null },
      {
        version: 14.2,
        status: 'preview',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/d5f7da21207f7808dffb3932fa61d22614e6bd57',
            },
          ],
        },
      },
      {
        version: 15,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/b136e9eea6c9b22796186262292db738cd4d1a12',
            },
          ],
        },
      },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'provideClientHydration',
    name: 'provideClientHydration',
    package: '@angular/platform-browser',
    metadata: {
      description:
        'Sets up providers necessary to enable hydration functionality for the application.',
      documentationUrl: 'https://angular.dev/guide/hydration',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'preview' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: '*ngIf',
    name: '*ngIf',
    package: '@angular/common',
    metadata: {
      description:
        'Structural directives are directives which change the DOM layout by adding and removing DOM elements.',
      documentationUrl: 'https://angular.dev/guide/directives/structural-directives#',
      migrationScript: 'ng generate @angular/core:control-flow',
      replacedBy: '@if',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20,
        status: 'deprecated',
        metadata: {
          notes: 'ng update mandatory migration',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60492',
            },
          ],
        },
      },
      { version: 21, status: 'deprecated' },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: '*ngFor',
    name: '*ngFor',
    package: '@angular/common',
    metadata: {
      description:
        'Structural directives are directives which change the DOM layout by adding and removing DOM elements.',
      documentationUrl: 'https://angular.dev/guide/directives/structural-directives#',
      migrationScript: 'ng generate @angular/core:control-flow',
      replacedBy: '@for',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20,
        status: 'deprecated',
        metadata: {
          notes: 'ng update mandatory migration',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60492',
            },
          ],
        },
      },
      { version: 21, status: 'deprecated' },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: '*ngSwitch',
    name: '*ngSwitch',
    package: '@angular/common',
    metadata: {
      description:
        'Structural directives are directives which change the DOM layout by adding and removing DOM elements.',
      documentationUrl: 'https://angular.dev/guide/directives/structural-directives#',
      migrationScript: 'ng generate @angular/core:control-flow',
      replacedBy: '@switch',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20,
        status: 'deprecated',
        metadata: {
          notes: 'ng update mandatory migration',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60492',
            },
          ],
        },
      },
      { version: 21, status: 'deprecated' },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: 'HammerJS integration',
    name: 'HammerJS integration',
    package: '@angular/platform-browser',
    metadata: {
      description: 'An injectable HammerJS Manager for gesture recognition.',
      documentationUrl: 'https://hammerjs.github.io/',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20,
        status: 'deprecated',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60257',
            },
          ],
        },
      },
      { version: 21, status: 'deprecated' },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: 'platformServerTesting',
    name: 'platformServerTesting',
    package: '@angular/platform-server/testing',
    metadata: {
      description: 'Supplies a testing module for the Angular platform server subsystem.',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20,
        status: 'deprecated',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60915',
            },
          ],
        },
      },
      { version: 21, status: 'deprecated' },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: 'ServerTestingModule',
    name: 'ServerTestingModule',
    package: '@angular/platform-server/testing',
    metadata: {
      description: 'Supplies a testing module for the Angular platform server subsystem.',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20,
        status: 'deprecated',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60915',
            },
          ],
        },
      },
      { version: 21, status: 'deprecated' },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: 'TestBed.get',
    name: 'TestBed.get',
    package: '@angular/core/testing',
    metadata: {
      description: 'Supplies a testing module for the Angular platform server subsystem.',
    },
    versions: [
      { version: 13, status: 'deprecated' },
      { version: 14, status: 'deprecated' },
      { version: 15, status: 'deprecated' },
      { version: 16, status: 'deprecated' },
      { version: 17, status: 'deprecated' },
      { version: 18, status: 'deprecated' },
      { version: 19, status: 'deprecated' },
      {
        version: 20,
        status: 'removed',
        metadata: {
          notes: 'use TestBed.inject() instead',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60915',
            },
          ],
        },
      },
      { version: 21, status: 'removed' },
      { version: 22, status: 'removed' },
    ],
  },
  {
    id: 'TestBed.flushEffects',
    name: 'TestBed.flushEffects',
    package: '@angular/core/testing',
    metadata: {
      description: 'Execute any pending effects. use `TestBed.tick()` instead',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: 'preview' },
      { version: 18, status: 'preview' },
      { version: 19, status: 'preview' },
      {
        version: 20,
        status: 'deprecated',
        metadata: {
          notes: 'use TestBed.tick() instead',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60915',
            },
          ],
        },
      },
      { version: 21, status: 'deprecated' },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: 'provideCheckNoChangesConfig',
    name: 'provideCheckNoChangesConfig',
    package: '@angular/core',
    metadata: {
      description:
        'Used to disable exhaustive checks when verifying no expressions changed after they were checked.',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: 'experimental' },
      { version: 19, status: 'experimental' },
      {
        version: 20,
        status: 'preview',
        metadata: {
          notes: 'Renamed from provideExperimentalCheckNoChangesForDebug',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/60906',
            },
          ],
        },
      },
      { version: 21, status: 'preview' },
      { version: 22, status: 'preview' },
    ],
  },
  {
    id: 'Vitest',
    name: 'Vitest',
    package: '@angular/build',
    metadata: {
      description: 'unit-testing and browser Vitest testing support',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      {
        version: 20,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular-cli/commit/12def3a2e907ca8e7d530cea1b39bba90e153144',
            },
          ],
        },
      },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'withComponentInputBinding',
    name: 'withComponentInputBinding',
    package: '@angular/router',
    metadata: {
      description:
        'Enables binding information from the Router state directly to the inputs of the component in Route configurations.',
      documentationUrl:
        'https://angular.dev/guide/routing/common-router-tasks#add-withcomponentinputbinding',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'unified-control-state-change-events',
    name: 'Unified control state change events',
    package: '@angular/forms',
    metadata: {
      description:
        'Unified way to listen to all form events: ValueChangeEvent, StatusChangeEvent, PristineChangeEvent and TouchedChangeEvent',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'provideBrowserGlobalErrorListeners',
    name: 'provideBrowserGlobalErrorListeners',
    package: '@angular/core',
    metadata: {
      description:
        'Provides an environment initializer which forwards unhandled errors to the ErrorHandler.',
      documentationUrl: 'https://angular.dev/best-practices/error-handling#client-side-rendering',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'inject',
    name: 'inject()',
    package: '@angular/core',
    metadata: {
      description:
        'Injects a token from the currently active injector. inject is only supported in an injection context. ',
      documentationUrl: 'https://angular.dev/best-practices/error-handling#client-side-rendering',
      migrationScript: 'ng generate @angular/core:inject',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20,
        status: 'stable',
        metadata: {
          notes: 'recommended over constructor in the new official style guide',
        },
      },
      { version: 21, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'NG_BUILD_OPTIMIZE_CHUNKS',
    name: 'NG_BUILD_OPTIMIZE_CHUNKS',
    package: '@angular/cli',
    metadata: {
      description: 'chunk optimizer for production application builds',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: 'experimental' },
      { version: 19, status: 'experimental' },
      { version: 20, status: 'experimental' },
      { version: 21, status: 'experimental' },
      { version: 22, status: 'experimental' },
    ],
  },
  {
    id: 'provideAnimationsAsync',
    name: 'provideAnimationsAsync',
    package: '@angular/animations',
    metadata: {
      description: 'Renders animations only once the renderer is loaded',
      documentationUrl:
        'https://angular.dev/api/platform-browser/animations/async/provideAnimationsAsync#',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20.2,
        status: 'deprecated',
        metadata: {
          notes: 'use animate.enter and animate.leave instead',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/62795',
            },
          ],
        },
      },
      { version: 21, status: 'deprecated' },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: '@angular/animations package',
    name: '@angular/animations package',
    package: '@angular/animations',
    metadata: {
      description: 'Renders animations only once the renderer is loaded',
      documentationUrl: 'https://angular.dev/guide/animations/css',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20.2,
        status: 'deprecated',
        metadata: {
          notes: 'use animate.enter and animate.leave instead',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/62795',
            },
          ],
        },
      },
      { version: 21, status: 'deprecated' },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: 'get-current-navigation',
    name: 'Router.getCurrentNavigation',
    package: '@angular/router',
    metadata: {
      description: 'Returns the current navigation object',
      documentationUrl: 'https://angular.dev/guide/animations/css',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      {
        version: 20.2,
        status: 'deprecated',
        metadata: {
          notes: 'use Router.currentNavigation instead',
        },
      },
      { version: 21, status: 'deprecated' },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: 'navigation-api-support',
    name: 'withExperimentalPlatformNavigation',
    package: '@angular/router',
    metadata: {
      description: 'Navigation Web API support',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      {
        version: 21.1,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/7003e8d2417660f71b3a2a017aff3e650c8d9646',
            },
          ],
        },
      },
      { version: 22, status: 'experimental' },
    ],
  },
  {
    id: 'signal-forms',
    name: 'Signal forms',
    package: '@angular/forms',
    metadata: {
      description: 'Signal forms',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      {
        version: 21,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/63408',
            },
          ],
        },
      },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'form-array-directive',
    name: 'FormArrayDirective',
    package: '@angular/forms',
    metadata: {
      description:
        'FormArrayDirective enables wrapping a HTML form without relying on FormGroupDirective',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      {
        version: 21,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/pull/55880',
            },
          ],
        },
      },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'enable-profiling',
    name: 'enableProfiling()',
    package: '@angular/core',
    metadata: {
      description: 'Enable profiling of the application',
      documentationUrl: 'https://angular.dev/best-practices/profiling-with-chrome-devtools',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: 'experimental' },
      { version: 22, status: 'experimental' },
    ],
  },
  {
    id: 'angular-aria',
    name: 'Angular Aria',
    package: '@angular/aria',
    metadata: {
      description: 'Angular Aria',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: 'preview' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'version-upgrade',
    name: 'VERSION',
    package: '@angular/upgrade',
    metadata: {
      description: 'Angular version used by the project',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      {
        version: 21.1,
        status: 'deprecated',
        metadata: {
          notes: 'Please use the entry from @angular/upgrade/static instead.',
        },
      },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: 'router-is-active',
    name: 'Router.isActive',
    package: '@angular/router',
    metadata: {
      description: 'Returns a Signal<boolean> indicating if the current route is active',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      {
        version: 21.1,
        status: 'deprecated',
        metadata: {
          notes: 'Replaced by a computed Signal version of Router.isActive',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/e44839b01640505e554fff16f24e08f282a557c0',
            },
          ],
        },
      },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: 'withAutoCleanupInjectors',
    name: 'withAutoCleanupInjectors',
    package: '@angular/router',
    metadata: {
      description: 'Enable automatic cleanup of unused route injectors',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      {
        version: 21.1,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/5edceffd0431f5a25e111a731db521e966b91f86',
            },
          ],
        },
      },
      { version: 22, status: 'experimental' },
      { version: 22.2, status: 'stable' },
    ],
  },
  {
    id: 'resourceSnapshot',
    name: 'ResourceSnapshot',
    package: '@angular/core',
    metadata: {
      description: "An explicit representation of a resource's state",
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      {
        version: 21.2,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/1ba9b7ac5001b315cc9df78c518964dbf479d647#diff-8182d3d1c5f1224cd109969446903a655ba093e4a1c3011be680b70c578b903eR249-R253',
            },
          ],
        },
      },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'resourceFromSnapshots',
    name: 'resourceFromSnapshots',
    package: '@angular/core',
    metadata: {
      description: 'Creates a Resource driven by a source of ResourceSnapshots',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      {
        version: 21.2,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/1ba9b7ac5001b315cc9df78c518964dbf479d647#diff-44fd5671f0cd20b2d286f08c4846dfca05e82f51d9bfae3ab75f5c846c665eccR15-R19',
            },
          ],
        },
      },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'withFetch',
    name: 'withFetch',
    package: '@angular/common/http',
    metadata: {
      description: 'Use the Fetch API instead of XHR',
      replacedBy: 'withXhr',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16.1, status: 'preview' },
      { version: 17.1, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      {
        version: 22,
        status: 'deprecated',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/5c432fb8bb69343ef2633811c37c0c6c0fd65126',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'changeDetectionStrategyDefault',
    name: 'ChangeDetectionStrategy.Default',
    package: '@angular/core',
    metadata: {
      description: 'Renamed to ChangeDetectionStrategy.Eager',
      replacedBy: 'ChangeDetectionStrategy.Eager',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21.2, status: 'deprecated' },
      { version: 22, status: 'deprecated' },
    ],
  },
  {
    id: 'changeDetectionStrategyEager',
    name: 'ChangeDetectionStrategy.Eager',
    package: '@angular/core',
    metadata: {
      description: 'Renamed from ChangeDetectionStrategy.Default',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21.2, status: 'stable' },
      { version: 22, status: 'stable' },
    ],
  },
  {
    id: 'withXhr',
    name: 'withXhr',
    package: '@angular/common/http',
    metadata: {
      description: 'Use the XMLHttpRequest API instead of the Fetch API',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: null },
      {
        version: 22,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/5c432fb8bb69343ef2633811c37c0c6c0fd65126',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'getLastFixture',
    name: 'TestBed.getLastFixture',
    package: '@angular/core/testing',
    metadata: {
      description: 'Get the last fixture for the test',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: null },
      {
        version: 22,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/dc3131c639542ad6a463bff3da5ca84c6f8ecb6f',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'htmlElementComments',
    name: 'HTML element comments',
    package: '@angular/compiler',
    metadata: {
      description: 'HTML element comments',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: null },
      {
        version: 22,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/e850643b1b8dca8cfdc12705be51441197cd987a',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'defaultOnPushStrategy',
    name: 'default OnPush strategy',
    package: '@angular/core',
    metadata: {
      description: 'Default OnPush strategy',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: null },
      {
        version: 22,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/eae8f7e30b9f8bebdcdb535bd86260199c34274b',
            },
          ],
        },
      },
    ],
  },
  {
    id: '@Service decorator',
    name: '@Service decorator',
    package: '@angular/core',
    metadata: {
      description: 'more ergonomic alternative to @Injectable decorator',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: null },
      {
        version: 22,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/8f3d0b9d97424e058eb7bce57d80833fb68dec4a',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'provideExperimentalWebMcpTools',
    name: 'provideExperimentalWebMcpTools',
    package: '@angular/core',
    metadata: {
      description:
        'Provides a list of WebMCP tools tied to the lifecycle of the associated Injector.',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: null },
      {
        version: 22,
        status: 'experimental',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/3b0ae5fef0328477ee0f5d51980217e7c583a606',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'injectAsync',
    name: 'injectAsync',
    package: '@angular/core',
    metadata: {
      description: 'Lazy load services and use the DI system to create them.',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: null },
      {
        version: 22,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/444b024d49725afc8b40aec67cfdb63a1f7f23ea',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'debounced',
    name: 'debounced',
    package: '@angular/core',
    metadata: {
      description: 'create a debounced version of a signal, represented as a Resource',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: null },
      {
        version: 22,
        status: 'stable',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/b918beda323eefef17bf1de03fde3d402a3d4af0',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'ChangeDetectorRefCheckNoChanges',
    name: 'ChangeDetectorRef.checkNoChanges',
    package: '@angular/core',
    metadata: {
      description: 'Do a change detection run to make sure there were no changes.',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      {
        version: 22,
        status: 'stable',
        metadata: {
          notes: 'use fixture.detectChanges() instead',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/b918beda323eefef17bf1de03fde3d402a3d4af0',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'ComponentFactoryResolver',
    name: 'ComponentFactoryResolver',
    package: '@angular/core',
    metadata: {
      description: '',
    },
    versions: [
      { version: 13, status: 'deprecated' },
      { version: 14, status: 'deprecated' },
      { version: 15, status: 'deprecated' },
      { version: 16, status: 'deprecated' },
      { version: 17, status: 'deprecated' },
      { version: 18, status: 'deprecated' },
      { version: 19, status: 'deprecated' },
      { version: 20, status: 'deprecated' },
      { version: 21, status: 'deprecated' },
      {
        version: 22,
        status: 'removed',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/9d76ac82290e047f1481fb38bd95233e951a77de',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'ComponentFactory',
    name: 'ComponentFactory',
    package: '@angular/core',
    metadata: {
      description: '',
    },
    versions: [
      { version: 13, status: 'deprecated' },
      { version: 14, status: 'deprecated' },
      { version: 15, status: 'deprecated' },
      { version: 16, status: 'deprecated' },
      { version: 17, status: 'deprecated' },
      { version: 18, status: 'deprecated' },
      { version: 19, status: 'deprecated' },
      { version: 20, status: 'deprecated' },
      { version: 21, status: 'deprecated' },
      {
        version: 22,
        status: 'removed',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/9d76ac82290e047f1481fb38bd95233e951a77de',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'webpackBuilder',
    name: 'Webpack Builders',
    package: '@angular-devkit/build-*',
    metadata: {
      description: '',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      {
        version: 22,
        status: 'deprecated',
        metadata: {
          notes:
            'Migrate to the @angular/build builders (esbuild/application) for your application builds.',
          links: [
            {
              type: LinkType.COMMIT,
              url: 'https://github.com/angular/angular/commit/9d76ac82290e047f1481fb38bd95233e951a77de',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'commonEngine',
    name: 'CommonEngine',
    package: '@angular/ssr',
    metadata: {
      description: '',
    },
    versions: [
      { version: 13, status: 'stable' },
      { version: 14, status: 'stable' },
      { version: 15, status: 'stable' },
      { version: 16, status: 'stable' },
      { version: 17, status: 'stable' },
      { version: 18, status: 'stable' },
      { version: 19, status: 'stable' },
      { version: 20, status: 'stable' },
      { version: 21, status: 'stable' },
      {
        version: 22,
        status: 'deprecated',
        metadata: {
          notes: 'Migrate to AngularNodeAppEngine or AngularAppEngine instead',
          links: [
            {
              type: LinkType.COMMIT,
              url: '',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'jestBuilder',
    name: 'Jest builder',
    package: '@angular/devkit/build-angular:jest',
    metadata: {
      description: '',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: 'experimental' },
      { version: 17, status: 'experimental' },
      { version: 18, status: 'experimental' },
      { version: 19, status: 'experimental' },
      { version: 20, status: 'experimental' },
      { version: 21, status: 'deprecated' },
      {
        version: 22,
        status: 'removed',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: '',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'webTestRunnerBuilder',
    name: 'Web Test Runner builder',
    package: '@angular-devkit/build-angular:web-test-runner',
    metadata: {
      description: '',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: 'experimental' },
      { version: 18, status: 'experimental' },
      { version: 19, status: 'experimental' },
      { version: 20, status: 'experimental' },
      { version: 21, status: 'deprecated' },
      {
        version: 22,
        status: 'removed',
        metadata: {
          links: [
            {
              type: LinkType.COMMIT,
              url: '',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'boundary',
    name: '@boundary',
    package: '@angular/core',
    metadata: {
      description:
        'Control flow mechanism that lets you intercept and handle rendering errors in templates.',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: null },
      { version: 22, status: null },
      { version: 22.2, status: 'preview' },
    ],
  },
  {
    id: 'router-resource',
    name: 'router resource',
    package: '@angular/router',
    metadata: {
      description: 'fetch data reactively using Resource APIs in the router',
    },
    versions: [
      { version: 13, status: null },
      { version: 14, status: null },
      { version: 15, status: null },
      { version: 16, status: null },
      { version: 17, status: null },
      { version: 18, status: null },
      { version: 19, status: null },
      { version: 20, status: null },
      { version: 21, status: null },
      { version: 22, status: null },
      { version: 22.2, status: 'preview' },
    ],
  },
];
