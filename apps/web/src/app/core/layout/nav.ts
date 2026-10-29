import type { MegaMenuItem } from '@openng/optimus-ui/api';
import { LATEST_MAJOR } from '@openng/core-angular-versions';

/** A page or a tab in the menu: icon, title and one line saying what you find there. */
export interface NavLink {
  label: string;
  description: string;
  icon: string;
  routerLink: string;
}

/** A top-level entry: its columns are lists of titled groups of links. */
export interface NavSection extends MegaMenuItem {
  label: string;
  icon: string;
  /** Regular expression of the URL paths that mark the section as current. */
  path: string;
  items: { label: string; items: NavLink[] }[][];
}

/**
 * Features grouped by who they serve: "Community" is the people (where to meet, what to listen
 * to), "Can I Use" is Angular itself (what each version supports, how to upgrade, the tooling),
 * "Releases" is one major at a time (what it brought, what to check when updating).
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Community',
    icon: 'pi pi-users',
    path: '/(events|communities|podcasts|contribute)',
    items: [
      [
        {
          label: 'Meet',
          items: [
            {
              label: 'Events',
              description: 'Conferences, meetups and workshops',
              icon: 'pi pi-calendar',
              routerLink: '/events',
            },
            {
              label: 'Communities',
              description: 'The groups near you, or online',
              icon: 'pi pi-users',
              routerLink: '/communities',
            },
          ],
        },
      ],
      [
        {
          label: 'Listen',
          items: [
            {
              label: 'Podcasts',
              description: 'Angular shows, in several languages',
              icon: 'pi pi-microphone',
              routerLink: '/podcasts',
            },
          ],
        },
      ],
      [
        {
          label: 'Share',
          items: [
            {
              label: 'Add to the hub',
              description: 'An event, a community or a podcast',
              icon: 'pi pi-send',
              routerLink: '/contribute',
            },
          ],
        },
      ],
    ],
  },
  {
    label: 'Can I Use',
    icon: 'pi pi-flask',
    path: '/(caniuse|libraries)',
    items: [
      [
        {
          label: 'Angular',
          items: [
            {
              label: 'Features',
              description: 'Every feature’s status, version by version',
              icon: 'pi pi-flask',
              routerLink: '/caniuse',
            },
            {
              label: 'NG Update',
              description: 'The migrations each version runs',
              icon: 'pi pi-sync',
              routerLink: '/caniuse/update',
            },
          ],
        },
      ],
      [
        {
          label: 'Tooling',
          items: [
            {
              label: 'MCP server',
              description: 'What the Angular MCP server offers',
              icon: 'pi pi-sparkles',
              routerLink: '/caniuse/mcp',
            },
            {
              label: 'ESLint rules',
              description: 'angular-eslint rules and when they landed',
              icon: 'pi pi-check-square',
              routerLink: '/caniuse/eslint',
            },
          ],
        },
      ],
      [
        {
          label: 'Ecosystem',
          items: [
            {
              label: 'Library health',
              description: `Does this library support Angular ${LATEST_MAJOR}?`,
              icon: 'pi pi-box',
              routerLink: '/libraries',
            },
          ],
        },
      ],
    ],
  },
  {
    label: 'Releases',
    icon: 'pi pi-megaphone',
    path: '/releases',
    items: [
      [
        {
          label: `Angular ${LATEST_MAJOR}`,
          items: [
            {
              label: 'Release insights',
              description: `What Angular ${LATEST_MAJOR} brought, at a glance`,
              icon: 'pi pi-megaphone',
              routerLink: `/releases/${LATEST_MAJOR}`,
            },
            // TODO(migration-guide): restore the "Migration guide" entry here (description "What to
            // check when updating", icon pi pi-directions, routerLink /releases/<latest>/guide) when
            // the section comes back; see HIDDEN_SECTIONS in server/releases/index.ts.
            {
              label: 'Features',
              description: 'Features that changed stage',
              icon: 'pi pi-flask',
              routerLink: `/releases/${LATEST_MAJOR}/features`,
            },
          ],
        },
      ],
      [
        {
          label: 'Under the hood',
          items: [
            {
              label: 'Commits',
              description: 'Every commit of the stable releases',
              icon: 'pi pi-code',
              routerLink: `/releases/${LATEST_MAJOR}/commits`,
            },
            {
              label: 'Commit search',
              description: 'Every commit of every release, searchable',
              icon: 'pi pi-search',
              routerLink: '/releases/commits',
            },
            {
              label: 'Changelogs',
              description: 'Release notes on GitHub',
              icon: 'pi pi-list',
              routerLink: `/releases/${LATEST_MAJOR}/changelogs`,
            },
          ],
        },
      ],
    ],
  },
];
