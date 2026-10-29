import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Theme } from './theme';

describe('Theme', () => {
  let listeners: ((event: { matches: boolean }) => void)[];

  beforeEach(() => {
    listeners = [];
    localStorage.clear();
    document.documentElement.classList.remove('hub-dark');
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
        listeners.push(listener),
      removeEventListener: vi.fn(),
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('starts from the class index.html set before the first paint', () => {
    document.documentElement.classList.add('hub-dark');
    expect(TestBed.inject(Theme).dark()).toBe(true);
  });

  it('toggles the class and remembers the choice', () => {
    const theme = TestBed.inject(Theme);
    theme.toggle();
    expect(theme.dark()).toBe(true);
    expect(TestBed.inject(DOCUMENT).documentElement.classList.contains('hub-dark')).toBe(true);
    expect(localStorage.getItem('hub-theme')).toBe('dark');
    theme.toggle();
    expect(theme.dark()).toBe(false);
    expect(localStorage.getItem('hub-theme')).toBe('light');
  });

  it('follows the OS setting only until the visitor has chosen', () => {
    const theme = TestBed.inject(Theme);
    expect(listeners).toHaveLength(1);
    listeners[0]!({ matches: true });
    expect(theme.dark()).toBe(true);
    theme.toggle(); // light, saved
    listeners[0]!({ matches: true });
    expect(theme.dark()).toBe(false);
  });
});
