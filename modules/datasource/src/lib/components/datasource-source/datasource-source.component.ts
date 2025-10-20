import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AttributeValue } from '@rollthecloudinc/attributes';

@Component({
    selector: 'classifieds-ui-datasource-source',
    template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-datasource-source-form formControlName="settings" [settings]="settings"></classifieds-ui-datasource-source-form></ng-container>`,
    standalone: false
})
export class DatasourceSourceComponent {
  @Input() settings: Array<AttributeValue> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}