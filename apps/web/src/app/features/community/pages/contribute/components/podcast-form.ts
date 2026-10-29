import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from '@openng/optimus-ui/inputtext';

import type { ContributeOptions } from '../../../community.model';
import type { Draft } from '../draft';
import { Field } from './field';

/** The fields of a new podcast. */
@Component({
  selector: 'hub-podcast-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-5' },
  imports: [FormsModule, InputText, Field],
  template: `
    <hub-field label="Name" inputId="f-pname" [error]="errors()['name']">
      <input
        pInputText
        id="f-pname"
        [ngModel]="draft().name"
        (ngModelChange)="set('name', $event)"
        name="name"
      />
    </hub-field>
    <hub-field label="Podcast page" inputId="f-purl" [error]="errors()['url']">
      <input
        pInputText
        id="f-purl"
        type="url"
        [ngModel]="draft().url"
        (ngModelChange)="set('url', $event)"
        name="url"
        placeholder="https://"
      />
    </hub-field>
    <hub-field label="Cover image URL" inputId="f-plogo" [error]="errors()['logo']">
      <input
        pInputText
        id="f-plogo"
        type="url"
        [ngModel]="draft().logo"
        (ngModelChange)="set('logo', $event)"
        name="logo"
        placeholder="https://…/cover.png"
      />
    </hub-field>
    <hub-field label="Language" inputId="f-language" [error]="errors()['language']">
      <input
        pInputText
        id="f-language"
        list="known-languages"
        [ngModel]="draft().language"
        (ngModelChange)="set('language', $event)"
        name="language"
      />
      <datalist id="known-languages">
        @for (language of options().languages; track language) {
          <option [value]="language"></option>
        }
      </datalist>
    </hub-field>
    <hub-field label="Description" inputId="f-description" [error]="errors()['description']">
      <textarea
        pInputText
        id="f-description"
        rows="3"
        [ngModel]="draft().description"
        (ngModelChange)="set('description', $event)"
        name="description"
      ></textarea>
    </hub-field>
  `,
})
export class PodcastForm {
  readonly draft = model.required<Draft>();
  readonly options = input.required<ContributeOptions>();
  /** Messages per field, once the form has been checked. */
  readonly errors = input.required<Partial<Record<string, string>>>();

  protected set(field: keyof Draft, value: string): void {
    this.draft.update((draft) => ({ ...draft, [field]: value }));
  }
}
