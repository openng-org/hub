import { describe, expect, it } from 'vitest';

import {
  apiKey,
  deprecationTimelines,
  entryPointOf,
  parseGolden,
  type ApiSnapshot,
} from './goldens.ts';
import { parseVersion } from './versions.ts';

describe('entryPointOf', () => {
  it('maps the report of an entry point to its import path, for every naming scheme', () => {
    expect(entryPointOf('public-api/core/index.api.md')).toBe('@angular/core');
    expect(entryPointOf('public-api/common/http/testing/index.md')).toBe(
      '@angular/common/http/testing',
    );
    expect(entryPointOf('public-api/animations/browser/browser.md')).toBe(
      '@angular/animations/browser',
    );
  });

  it('leaves out the other reports', () => {
    expect(entryPointOf('public-api/core/errors.api.md')).toBeNull();
    expect(entryPointOf('public-api/compiler-cli/compiler_options.md')).toBeNull();
    expect(entryPointOf('README.md')).toBeNull();
    expect(entryPointOf('circular-deps/packages.json')).toBeNull();
  });
});

const REPORT = `## API Report File for "@angular/core"

\`\`\`ts
import { Observable } from 'rxjs';

// @public @deprecated
export abstract class Compiler {
    // @deprecated
    compile(): void;
}

// Warning: (ae-forgotten-export) The symbol "X" needs to be exported
//
// @public @deprecated (undocumented)
export const ANALYZE: InjectionToken<any>;

// @public
export function inject(token: string): void;

// @public @deprecated
export function inject(token: number): void;

// @public
export declare const enum Flags {
    Default = 0
}

// @public (undocumented)
export interface ResponseInit_2 {
}

// @public @deprecated
export type Old = string;
\`\`\``;

describe('parseGolden', () => {
  it('reads every top-level export, deprecated when all its declarations are', () => {
    expect(Object.fromEntries(parseGolden(REPORT))).toEqual({
      Compiler: true,
      ANALYZE: true,
      inject: false,
      Flags: false,
      Old: true,
    });
  });
});

const snapshot = (tag: string, apis: Record<string, boolean>): ApiSnapshot => ({
  version: parseVersion(tag)!,
  apis: new Map(Object.entries(apis).map(([name, dep]) => [apiKey('@angular/core', name), dep])),
});

describe('deprecationTimelines', () => {
  it('records the status per major, with the minor where it changed', () => {
    const timelines = deprecationTimelines([
      snapshot('21.0.0', { Old: false, Gone: true, Kept: false }),
      snapshot('19.0.0', { Kept: false }),
      snapshot('20.0.0', { Old: false, Kept: false }),
      snapshot('20.2.0', { Old: true, Gone: true, Kept: false }),
      snapshot('21.1.0', { Old: false, Kept: false }),
    ]);
    expect(timelines).toEqual([
      {
        name: 'Gone',
        package: '@angular/core',
        versions: [
          { version: 19, status: null },
          { version: 20.2, status: 'deprecated' },
          { version: 21.1, status: 'removed' },
        ],
      },
      {
        name: 'Old',
        package: '@angular/core',
        versions: [
          { version: 19, status: null },
          { version: 20.2, status: 'deprecated' },
          // Back to stable at 21.0: a change at the start of a major is the major itself.
          { version: 21, status: 'stable' },
        ],
      },
    ]);
  });
});
