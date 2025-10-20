import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AttributeValue } from '@rollthecloudinc/attributes';

@Component({
    selector: 'classifieds-ui-transform-select',
    template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-select-source-form formControlName="settings" [settings]="settings"></classifieds-ui-select-source-form></ng-container>`,
    standalone: false
})
export class TransformSelectComponent {
  @Input() settings: Array<AttributeValue> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}