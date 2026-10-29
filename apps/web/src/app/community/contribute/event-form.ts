import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';

import { ChipFilter } from '../../ui/chip-filter';
import type { ContributeOptions } from '../data/api';
import { FORMAT_OPTIONS, PRICE_OPTIONS, TYPE_OPTIONS, isNewPlace, type Draft } from './draft';
import { Field } from './field';

/** The fields of a new event. */
@Component({
  selector: 'hub-event-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-5' },
  imports: [FormsModule, RouterLink, InputTextModule, SelectModule, ChipFilter, Field],
  template: `
    <hub-field label="Name" inputId="f-name" [error]="errors()['name']">
      <input
        pInputText
        id="f-name"
        [ngModel]="draft().name"
        (ngModelChange)="set('name', $event)"
        name="name"
        placeholder="NG Paris #12"
      />
    </hub-field>
    <hub-field label="Organized by" inputId="f-organizer" [error]="errors()['organizerId']">
      <p-select
        inputId="f-organizer"
        [options]="options().organizers"
        optionLabel="label"
        optionValue="value"
        [filter]="true"
        placeholder="Pick a community"
        [ngModel]="draft().organizerId"
        (ngModelChange)="set('organizerId', $event ?? '')"
        name="organizerId"
        styleClass="w-full"
      />
      <p class="hub-hint">
        Not listed?
        <a class="link" routerLink="/contribute" [queryParams]="{ kind: 'community' }"
          >Add the community first</a
        >.
      </p>
    </hub-field>
    <hub-field label="Type">
      <hub-chip-filter
        label="Type"
        [options]="typeOptions"
        [value]="draft().type"
        (valueChange)="set('type', $event)"
      />
    </hub-field>
    <hub-field label="Format" [error]="errors()['format']">
      <hub-chip-filter
        label="Format"
        [options]="formatOptions"
        [value]="draft().format"
        (valueChange)="set('format', $event)"
      />
    </hub-field>
    @if (draft().format !== 'online') {
      <hub-field label="City" inputId="f-location" [error]="errors()['location']">
        <input
          pInputText
          id="f-location"
          list="known-places"
          [ngModel]="draft().location"
          (ngModelChange)="set('location', $event)"
          name="location"
          placeholder="Paris, France"
        />
        <datalist id="known-places">
          @for (place of options().places; track place) {
            <option [value]="place"></option>
          }
        </datalist>
      </hub-field>
      @if (newPlace()) {
        <hub-field [label]="'Coordinates of ' + draft().location" [error]="errors()['place']">
          <div class="grid grid-cols-2 gap-3">
            <input
              pInputText
              aria-label="Latitude"
              inputmode="decimal"
              [ngModel]="draft().latitude"
              (ngModelChange)="set('latitude', $event)"
              name="latitude"
              placeholder="Latitude: 48.86"
            />
            <input
              pInputText
              aria-label="Longitude"
              inputmode="decimal"
              [ngModel]="draft().longitude"
              (ngModelChange)="set('longitude', $event)"
              name="longitude"
              placeholder="Longitude: 2.35"
            />
          </div>
          <p class="hub-hint">
            A new city on the map: right-click it in any map app to copy its coordinates.
          </p>
        </hub-field>
      }
    }
    <div class="grid gap-5 sm:grid-cols-2">
      <hub-field label="First day" inputId="f-date" [error]="errors()['date']">
        <input
          pInputText
          id="f-date"
          type="date"
          [ngModel]="draft().date"
          (ngModelChange)="set('date', $event)"
          name="date"
        />
      </hub-field>
      <hub-field
        label="Last day"
        optional="if several"
        inputId="f-end"
        [error]="errors()['endDate']"
      >
        <input
          pInputText
          id="f-end"
          type="date"
          [min]="draft().date"
          [ngModel]="draft().endDate"
          (ngModelChange)="set('endDate', $event)"
          name="endDate"
        />
      </hub-field>
    </div>
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
    <hub-field label="Event page" inputId="f-url" [error]="errors()['url']">
      <input
        pInputText
        id="f-url"
        type="url"
        [ngModel]="draft().url"
        (ngModelChange)="set('url', $event)"
        name="url"
        placeholder="https://"
      />
    </hub-field>
    <hub-field label="Price" [error]="errors()['startingPrice'] ?? errors()['currency']">
      <hub-chip-filter
        label="Price"
        [options]="priceOptions"
        [value]="draft().price"
        (valueChange)="set('price', $event)"
      />
      @if (draft().price === 'paid') {
        <div class="grid grid-cols-[1fr_6rem] gap-3 mt-2">
          <input
            pInputText
            aria-label="Starting price"
            inputmode="decimal"
            [ngModel]="draft().startingPrice"
            (ngModelChange)="set('startingPrice', $event)"
            name="startingPrice"
            placeholder="Starting price"
          />
          <input
            pInputText
            aria-label="Currency code"
            [ngModel]="draft().currency"
            (ngModelChange)="set('currency', $event)"
            name="currency"
            placeholder="EUR"
            maxlength="3"
          />
        </div>
      }
    </hub-field>
    <div class="grid gap-5 sm:grid-cols-2">
      <hub-field
        label="Call for papers"
        optional="optional"
        inputId="f-cfp"
        [error]="errors()['callForPapersUrl']"
      >
        <input
          pInputText
          id="f-cfp"
          type="url"
          [ngModel]="draft().callForPapersUrl"
          (ngModelChange)="set('callForPapersUrl', $event)"
          name="callForPapersUrl"
          placeholder="https://"
        />
      </hub-field>
      <hub-field
        label="Closes on"
        optional="optional"
        inputId="f-cfp-due"
        [error]="errors()['callForPapersDueDate']"
      >
        <input
          pInputText
          id="f-cfp-due"
          type="date"
          [ngModel]="draft().callForPapersDueDate"
          (ngModelChange)="set('callForPapersDueDate', $event)"
          name="callForPapersDueDate"
        />
      </hub-field>
    </div>
    <hub-field
      label="Description"
      optional="optional"
      inputId="f-description"
      [error]="errors()['description']"
    >
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
export class EventForm {
  readonly draft = model.required<Draft>();
  readonly options = input.required<ContributeOptions>();
  /** Messages per field, once the form has been checked. */
  readonly errors = input.required<Partial<Record<string, string>>>();

  protected readonly typeOptions = TYPE_OPTIONS;
  protected readonly formatOptions = FORMAT_OPTIONS;
  protected readonly priceOptions = PRICE_OPTIONS;

  protected readonly newPlace = computed(() => isNewPlace(this.draft(), this.options().places));

  protected set(field: keyof Draft, value: string): void {
    this.draft.update((draft) => ({ ...draft, [field]: value }));
  }
}
