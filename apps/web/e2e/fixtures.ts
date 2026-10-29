import { test as base } from '@playwright/test';

export type Theme = 'light' | 'dark';

/**
 * `hubTheme` picks the colour scheme of a project: the toggle's saved choice is seeded in
 * localStorage before the first page loads (index.html applies it before the first paint). A choice
 * made during the test (the toggle) is kept, so persistence across reloads can be checked.
 */
export const test = base.extend<{ hubTheme: Theme }>({
  hubTheme: ['light', { option: true }],
  context: async ({ context, hubTheme }, use) => {
    await context.addInitScript((value) => {
      if (!localStorage.getItem('hub-theme')) localStorage.setItem('hub-theme', value);
    }, hubTheme);
    await use(context);
  },
});

export { expect } from '@playwright/test';
