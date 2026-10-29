import { EslintCaniuse } from './eslint.model';

export const eslintCaniuseList: EslintCaniuse[] = [
  {
    name: 'contextual-lifecycle',
    description: 'Ensures that lifecycle methods are used in a correct context',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/contextual-lifecycle.md',
    version: '1.0.0',
  },
  {
    name: 'no-async-lifecycle-method',
    description:
      'Angular Lifecycle methods should not be async. Angular does not wait for async lifecycle but the code incorrectly suggests it does.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-async-lifecycle-method.md',
    version: '17.2.0',
  },
  {
    name: 'no-attribute-decorator',
    description:
      'The @Attribute decorator is used to obtain a single value for an attribute. This is a much less common use case than getting a stream of values (using @Input), so the @Attribute decorator is often mistakenly used when @Input is intended. This rule disallows the usage of @Attribute decorator entirely to prevent these mistakes.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-attribute-decorator.md',
    version: '1.0.0',
  },
  {
    name: 'no-developer-preview',
    description: 'Disallow using code which is marked as developer preview',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-developer-preview.md',
    version: '20.1.0',
  },
  {
    name: 'no-experimental',
    description: 'Disallow using code which is marked as experimental',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-experimental.md',
    version: '20.1.0',
  },
  {
    name: 'require-lifecycle-on-prototype',
    description:
      "Ensures that lifecycle methods are defined on the object's prototype instead of on an instance.",
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/require-lifecycle-on-prototype.md',
    version: '19.2.0',
  },
  {
    name: 'sort-lifecycle-methods',
    description: 'Ensures that lifecycle methods are declared in order of execution',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/sort-lifecycle-methods.md',
    version: '16.2.0',
  },
  {
    name: 'component-class-suffix',
    description:
      'Classes decorated with @Component must have suffix "Component" (or custom) in their name. Note: As of v20, this is no longer recommended by the Angular Team.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/component-class-suffix.md',
    version: '1.0.0',
  },
  {
    name: 'component-max-inline-declarations',
    description: 'Enforces a maximum number of lines in inline template, styles and animations.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/component-max-inline-declarations.md',
    version: '1.0.0',
  },
  {
    name: 'component-selector',
    description:
      'Component selectors should follow given naming rules. See more at https://angular.dev/style-guide#choosing-component-selectors.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/component-selector.md',
    version: '1.0.0',
  },
  {
    name: 'consistent-component-styles',
    description:
      'Ensures consistent usage of `styles` / `styleUrls` / `styleUrl` within Component metadata',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/consistent-component-styles.md',
    version: '17.3.0',
  },
  {
    name: 'contextual-decorator',
    description: 'Ensures that classes use contextual decorators in their body',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/contextual-decorator.md',
    version: '1.0.0',
  },
  {
    name: 'directive-class-suffix',
    description:
      'Classes decorated with @Directive must have suffix "Directive" (or custom) in their name. Note: As of v20, this is no longer recommended by the Angular Team.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/directive-class-suffix.md',
    version: '1.0.0',
  },
  {
    name: 'directive-selector',
    description:
      'Directive selectors should follow given naming rules. See more at https://angular.dev/style-guide#choosing-directive-selectors.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/directive-selector.md',
    version: '1.0.0',
  },
  {
    name: 'no-conflicting-lifecycle',
    description: 'Ensures that directives do not implement conflicting lifecycle interfaces.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-conflicting-lifecycle.md',
    version: '1.0.0',
  },
  {
    name: 'no-duplicates-in-metadata-arrays',
    description: 'Ensures that metadata arrays do not contain duplicate entries.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-duplicates-in-metadata-arrays.md',
    version: '17.4.0',
  },
  {
    name: 'no-empty-lifecycle-method',
    description: 'Disallows declaring empty lifecycle methods',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-empty-lifecycle-method.md',
    version: '1.0.0',
  },
  {
    name: 'no-forward-ref',
    description: 'Disallows usage of `forwardRef` references for DI',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-forward-ref.md',
    version: '1.0.0',
  },
  {
    name: 'no-input-prefix',
    description:
      'Ensures that input bindings, including aliases, are not named or prefixed by the configured disallowed prefixes',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-input-prefix.md',
    version: '1.0.0',
  },
  {
    name: 'no-input-rename',
    description: 'Ensures that input bindings are not aliased',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-input-rename.md',
    version: '1.0.0',
  },
  {
    name: 'no-inputs-metadata-property',
    description: 'Disallows usage of the `inputs` metadata property.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-inputs-metadata-property.md',
    version: '1.0.0',
  },
  {
    name: 'no-lifecycle-call',
    description: 'Disallows explicit calls to lifecycle methods.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-lifecycle-call.md',
    version: '1.0.0',
  },
  {
    name: 'no-output-native',
    description:
      'Ensures that output bindings, including aliases, are not named as standard DOM events.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-native.md',
    version: '1.0.0',
  },
  {
    name: 'no-output-on-prefix',
    description:
      'Ensures that output bindings, including aliases, are not named "on", nor prefixed with it. See more at https://angular.dev/guide/components/outputs#choosing-event-names.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-on-prefix.md',
    version: '1.0.0',
  },
  {
    name: 'no-output-rename',
    description: 'Ensures that output bindings are not aliased',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-rename.md',
    version: '1.0.0',
  },
  {
    name: 'no-outputs-metadata-property',
    description: 'Disallows usage of the `outputs` metadata property.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-outputs-metadata-property.md',
    version: '1.0.0',
  },
  {
    name: 'no-pipe-impure',
    description: 'Disallows the declaration of impure pipes.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-pipe-impure.md',
    version: '1.0.0',
  },
  {
    name: 'no-queries-metadata-property',
    description: 'Disallows usage of the `queries` metadata property.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-queries-metadata-property.md',
    version: '1.0.0',
  },
  {
    name: 'no-uncalled-signals',
    description:
      "Warns user about unintentionally doing logic on the signal, rather than the signal's value.",
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-uncalled-signals.md',
    version: '19.7.0',
  },
  {
    name: 'pipe-prefix',
    description: 'Enforce consistent prefix for pipes.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/pipe-prefix.md',
    version: '1.0.0',
  },
  {
    name: 'prefer-host-metadata-property',
    description: 'Use `host` metadata property instead of `@HostBinding` and `HostListener`.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-host-metadata-property.md',
    version: '20.5.0',
  },
  {
    name: 'prefer-inject',
    description: 'Prefer using the `inject()` function over constructor parameter injection.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-inject.md',
    version: '19.6.0',
  },
  {
    name: 'prefer-on-push-component-change-detection',
    description:
      "Ensures component's `changeDetection` is set to `ChangeDetectionStrategy.OnPush`.",
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-on-push-component-change-detection.md',
    version: '1.0.0',
  },
  {
    name: 'prefer-output-emitter-ref',
    description: 'Use `OutputEmitterRef` instead of `@Output()`.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-output-emitter-ref.md',
    version: '19.4.0',
  },
  {
    name: 'prefer-output-readonly',
    description:
      'Prefer to declare `@Output`, `OutputEmitterRef` and `OutputRef` as `readonly` since they are not supposed to be reassigned.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-output-readonly.md',
    version: '1.0.0',
  },
  {
    name: 'prefer-signals',
    description:
      'Use `readonly` signals instead of `@Input()`, `@ViewChild()` and other legacy decorators.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-signals.md',
    version: '19.0.0',
  },
  {
    name: 'prefer-standalone',
    description: 'Ensures Components, Directives and Pipes do not opt out of standalone.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-standalone.md',
    version: '17.3.0',
  },
  {
    name: 'relative-url-prefix',
    description:
      "The ./ and ../ prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix.",
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/relative-url-prefix.md',
    version: '1.0.0',
  },
  {
    name: 'require-localize-metadata',
    description:
      'Ensures that $localize tagged messages contain helpful metadata to aid with translations.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/require-localize-metadata.md',
    version: '1.0.0',
  },
  {
    name: 'runtime-localize',
    description: 'Ensures that $localize tagged messages can use runtime-loaded translations.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/runtime-localize.md',
    version: '18.3.0',
  },
  {
    name: 'sort-keys-in-type-decorator',
    description:
      'Ensures that keys in type decorators (Component, Directive, NgModule, Pipe) are sorted in a consistent order',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/sort-keys-in-type-decorator.md',
    version: '19.5.0',
  },
  {
    name: 'use-component-selector',
    description: 'Component selector must be declared',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-component-selector.md',
    version: '1.0.0',
  },
  {
    name: 'use-component-view-encapsulation',
    description: 'Disallows using ViewEncapsulation.None',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-component-view-encapsulation.md',
    version: '1.0.0',
  },
  {
    name: 'use-injectable-provided-in',
    description: 'Using the providedIn property makes Injectables tree-shakable',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-injectable-provided-in.md',
    version: '1.0.0',
  },
  {
    name: 'use-lifecycle-interface',
    description:
      'Ensures that classes implement lifecycle interfaces corresponding to the declared lifecycle methods. See more at https://angular.dev/style-guide#use-lifecycle-hook-interfaces',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-lifecycle-interface.md',
    version: '1.0.0',
  },
  {
    name: 'use-pipe-transform-interface',
    description: 'Ensures that Pipes implement PipeTransform interface',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-pipe-transform-interface.md',
    version: '1.0.0',
  },
  {
    name: 'no-duplicate-attributes',
    description: 'Ensures that there are no duplicate input properties or output event listeners',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-duplicate-attributes.md',
    version: '14.2.0',
  },
  {
    name: 'no-nested-tags',
    description: 'Denies nesting of and tags.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-nested-tags.md',
    version: '19.5.0',
  },
  {
    name: 'alt-text',
    description:
      '[Accessibility] Enforces alternate text for elements which require the alt, aria-label, aria-labelledby attributes.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/alt-text.md',
    version: '1.0.0',
  },
  {
    name: 'banana-in-box',
    description: 'Ensures that the two-way data binding syntax is correct',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/banana-in-box.md',
    version: '1.0.0',
  },
  {
    name: 'button-has-type',
    description: 'Ensures that a button has a valid type specified',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/button-has-type.md',
    version: '13.5.0',
  },
  {
    name: 'click-events-have-key-events',
    description:
      '[Accessibility] Ensures that the click event is accompanied with at least one key event keyup, keydown or keypress.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/click-events-have-key-events.md',
    version: '1.0.0',
  },
  {
    name: 'conditional-complexity',
    description: 'The conditional complexity should not exceed a rational limit',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/conditional-complexity.md',
    version: '1.0.0',
  },
  {
    name: 'cyclomatic-complexity',
    description:
      "Checks cyclomatic complexity against a specified limit. It is a quantitative measure of the number of linearly independent paths through a program's source code",
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/cyclomatic-complexity.md',
    version: '1.0.0',
  },
  {
    name: 'elements-content',
    description:
      '[Accessibility] Ensures that the heading, anchor and button elements have content in them',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/elements-content.md',
    version: '1.0.0',
  },
  {
    name: 'eqeqeq',
    description: 'Requires === and !== in place of == and !=',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/eqeqeq.md',
    version: '12.0.0',
  },
  {
    name: 'i18n',
    description:
      'Ensures following best practices for i18n. Checks for missing i18n attributes on elements and attributes containing texts. Can also check for texts without i18n attribute, elements that do not use custom ID (@@) feature and duplicate custom IDs',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/i18n.md',
    version: '1.0.0',
  },
  {
    name: 'interactive-supports-focus',
    description:
      '[Accessibility] Ensures that elements with interactive handlers like (click) are focusable.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/interactive-supports-focus.md',
    version: '14.2.0',
  },
  {
    name: 'label-has-associated-control',
    description:
      '[Accessibility] Ensures that a label element/component is associated with a form element',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/label-has-associated-control.md',
    version: '4.3.0',
  },
  {
    name: 'mouse-events-have-key-events',
    description:
      '[Accessibility] Ensures that the mouse events mouseout and mouseover are accompanied by focus and blur events respectively. Coding for the keyboard is important for users with physical disabilities who cannot use a mouse, AT compatibility, and screenreader users. See more at https://www.w3.org/WAI/WCAG21/Understanding/keyboard',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/mouse-events-have-key-events.md',
    version: '1.0.0',
  },
  {
    name: 'no-any',
    description: 'The use of "$any" nullifies the compile-time benefits of Angular\'s type system',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-any.md',
    version: '1.0.0',
  },
  {
    name: 'no-autofocus',
    description: '[Accessibility] Ensures that the autofocus attribute is not used',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-autofocus.md',
    version: '1.0.0',
  },
  {
    name: 'no-call-expression',
    description: 'Disallows calling expressions in templates, except for output handlers',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-call-expression.md',
    version: '1.0.0',
  },
  {
    name: 'no-distracting-elements',
    description: '[Accessibility] Enforces that no distracting elements are used',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-distracting-elements.md',
    version: '1.0.0',
  },
  {
    name: 'no-empty-control-flow',
    description:
      "Ensures that control flow blocks are not empty. Empty control flow blocks usually occur due to refactoring that wasn't completed. They can cause confusion when reading code.",
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-empty-control-flow.md',
    version: '20.2.0',
  },
  {
    name: 'no-inline-styles',
    description: 'Disallows the use of inline styles in HTML templates',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-inline-styles.md',
    version: '14.3.0',
  },
  {
    name: 'no-interpolation-in-attributes',
    description: 'Ensures that property-binding is used instead of interpolation in attributes.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-interpolation-in-attributes.md',
    version: '15.2.0',
  },
  {
    name: 'no-negated-async',
    description:
      'Ensures that async pipe results, as well as values used with the async pipe, are not negated',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-negated-async.md',
    version: '1.0.0',
  },
  {
    name: 'no-positive-tabindex',
    description: 'Ensures that the tabindex attribute is not positive',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-positive-tabindex.md',
    version: '1.0.0',
  },
  {
    name: 'prefer-at-else',
    description:
      'Prefer using @else instead of a second @if with the opposite condition to reduce code and make it easier to read.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-at-else.md',
    version: '20.4.0',
  },
  {
    name: 'prefer-at-empty',
    description:
      'Prefer using @empty with @for loops instead of a separate @if or @else block to reduce code and make it easier to read.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-at-empty.md',
    version: '19.5.0',
  },
  {
    name: 'prefer-built-in-pipes',
    description:
      'Encourages the use of Angular built-in pipes (e.g. lowercase, uppercase, titlecase) instead of certain JavaScript methods in Angular templates.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-built-in-pipes.md',
    version: '20.5.0',
  },
  {
    name: 'prefer-contextual-for-variables',
    description:
      'Ensures that contextual variables are used in @for blocks where possible instead of aliasing them.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-contextual-for-variables.md',
    version: '19.3.0',
  },
  {
    name: 'prefer-control-flow',
    description: 'Ensures that the built-in control flow is used.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-control-flow.md',
    version: '17.1.0',
  },
  {
    name: 'prefer-ngsrc',
    description: 'Ensures ngSrc is used instead of src for img elements',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-ngsrc.md',
    version: '16.2.0',
  },
  {
    name: 'prefer-template-literal',
    description:
      'Ensure that template literals are used instead of concatenating strings or expressions.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-template-literal.md',
    version: '19.4.0',
  },
  {
    name: 'role-has-required-aria',
    description:
      '[Accessibility] Ensures elements with ARIA roles have all required properties for that role.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/role-has-required-aria.md',
    version: '14.2.0',
  },
  {
    name: 'table-scope',
    description:
      '[Accessibility] Ensures that the scope attribute is only used on the <th> element',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/table-scope.md',
    version: '1.0.0',
  },
  {
    name: 'use-track-by-function',
    description: 'Ensures trackBy function is used',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/use-track-by-function.md',
    version: '1.0.0',
  },
  {
    name: 'valid-aria',
    description:
      '[Accessibility] Ensures that correct ARIA attributes and respective values are used',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/valid-aria.md',
    version: '1.0.0',
  },
  {
    name: 'attributes-order',
    description:
      'Ensures that HTML attributes and Angular bindings are sorted based on an expected order',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/attributes-order.md',
    version: '14.2.0',
  },
  {
    name: 'prefer-self-closing-tags',
    description:
      'Ensures that self-closing tags are used for elements with a closing tag but no content.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-self-closing-tags.md',
    version: '16.1.0',
  },
  {
    name: 'prefer-static-string-properties',
    description:
      'Ensures that static string values use property assignment instead of property binding.',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-static-string-properties.md',
    version: '19.1.0',
  },
  {
    name: 'prefer-signal-model',
    description: 'Use model instead of input and output for two-way bindings',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-signal-model.md',
    version: '21.1.0',
  },
  {
    name: 'no-implicit-takeuntil-destroyed',
    description:
      'Ensures that takeUntilDestroyed() is called with an explicit DestroyRef when used outside of an injection context',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-implicit-take-until-destroyed.md',
    version: '21.2.0',
  },
  {
    name: 'prefer-class-binding',
    description: 'Suggests using [class] bindings over ngClass where applicable',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/prefer-class-binding.md',
    version: '21.2.0',
  },
  {
    name: 'computed-must-return',
    description: 'Ensures that computed() returns a value. Omitting the value is likely a mistake.',
    type: 'eslint-plugin',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/computed-must-return.md',
    version: '21.3.0',
  },
  {
    name: 'no-non-null-assertion',
    description: 'Disallows the non-null assertion operator (!) in templates',
    type: 'eslint-plugin-template',
    url: 'https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/no-non-null-assertion.md',
    version: '21.3.0',
  },
];
