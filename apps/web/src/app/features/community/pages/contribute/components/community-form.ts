import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from '@openng/optimus-ui/inputtext';

import { COMMUNITY_LINKS, communityIdOf, type Draft } from '../draft';
import { Field } from './field';

/** The fields of a new community (an organizer in the dataset). */
@Component({
  selector: 'hub-community-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-5' },
  imports: [FormsModule, InputText, Field],
  template: `
    <hub-field label="Name" inputId="f-cname" [error]="errors()['name']">
      <input
        pInputText
        id="f-cname"
        [ngModel]="draft().name"
        (ngModelChange)="set('name', $event)"
        name="name"
        placeholder="Angular Lyon"
      />
    </hub-field>
    <hub-field
      label="Id"
      optional="used in URLs and by events"
      inputId="f-id"
      [error]="errors()['id']"
    >
      <input
        pInputText
        id="f-id"
        [ngModel]="communityId()"
        (ngModelChange)="set('id', $event)"
        name="id"
      />
    </hub-field>
    <hub-field label="City" optional="empty if online only" inputId="f-clocation">
      <input
        pInputText
        id="f-clocation"
        [ngModel]="draft().location"
        (ngModelChange)="set('location', $event)"
        name="location"
        placeholder="Lyon, France"
      />
    </hub-field>
    <hub-field label="Logo URL" optional="optional" inputId="f-logo" [error]="errors()['logo']">
      <input
        pInputText
        id="f-logo"
        type="url"
        [ngModel]="draft().logo"
        (ngModelChange)="set('logo', $event)"
        name="logo"
        placeholder="https://…/logo.png"
      />
    </hub-field>
    @for (link of links; track link.key) {
      <hub-field
        [label]="link.label"
        [optional]="link.key === 'websiteUrl' ? undefined : 'optional'"
        [inputId]="'f-' + link.key"
        [error]="errors()[link.key]"
      >
        <input
          pInputText
          type="url"
          [id]="'f-' + link.key"
          [ngModel]="draft()[link.key]"
          (ngModelChange)="set(link.key, $event)"
          [name]="link.key"
          placeholder="https://"
        />
      </hub-field>
    }
  `,
})
export class CommunityForm {
  readonly draft = model.required<Draft>();
  /** Messages per field, once the form has been checked. */
  readonly errors = input.required<Partial<Record<string, string>>>();

  protected readonly links = COMMUNITY_LINKS;
  protected readonly communityId = computed(() => communityIdOf(this.draft()));

  protected set(field: keyof Draft, value: string): void {
    this.draft.update((draft) => ({ ...draft, [field]: value }));
  }
}
