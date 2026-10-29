/**
 * The Aura preset, trimmed to the components this app renders.
 *
 * `@openng/optimus-ui-themes/aura` is one object with the design tokens of ~90 components; importing
 * it ships all of them. Composing the preset from the per-component entries keeps only what the
 * bundle can actually style. Add an entry here when a new Optimus component is imported.
 */
import base from '@openng/optimus-ui-themes/aura/base';
import css from '@openng/optimus-ui-themes/aura/css';
import badge from '@openng/optimus-ui-themes/aura/badge';
import breadcrumb from '@openng/optimus-ui-themes/aura/breadcrumb';
import button from '@openng/optimus-ui-themes/aura/button';
import card from '@openng/optimus-ui-themes/aura/card';
import dialog from '@openng/optimus-ui-themes/aura/dialog';
import divider from '@openng/optimus-ui-themes/aura/divider';
import iconfield from '@openng/optimus-ui-themes/aura/iconfield';
import inputtext from '@openng/optimus-ui-themes/aura/inputtext';
import megamenu from '@openng/optimus-ui-themes/aura/megamenu';
import select from '@openng/optimus-ui-themes/aura/select';
import skeleton from '@openng/optimus-ui-themes/aura/skeleton';
import tabs from '@openng/optimus-ui-themes/aura/tabs';
import tag from '@openng/optimus-ui-themes/aura/tag';
import tooltip from '@openng/optimus-ui-themes/aura/tooltip';
import treetable from '@openng/optimus-ui-themes/aura/treetable';

/**
 * Primary palette: the magenta of the Angular Hub logo (#bf25b9, the first stop of the wordmark
 * gradient) at 500, the other shades generated with `palette('#bf25b9')` from the themes package.
 * Aura derives everything else from it: buttons, links, focus rings, highlights, badges.
 */
const brandPrimary = {
  50: '#fcf4fc',
  100: '#f0cbee',
  200: '#e3a1e1',
  300: '#d778d4',
  400: '#cb4ec6',
  500: '#bf25b9',
  600: '#a21f9d',
  700: '#861a82',
  800: '#691466',
  900: '#4c0f4a',
  950: '#30092e',
};

export const HubPreset = {
  ...base,
  semantic: {
    ...base.semantic,
    primary: brandPrimary,
  },
  components: {
    badge,
    breadcrumb,
    button,
    card,
    dialog,
    divider,
    iconfield,
    inputtext,
    megamenu,
    select,
    skeleton,
    tabs,
    tag,
    tooltip,
    treetable,
  },
  css,
};
