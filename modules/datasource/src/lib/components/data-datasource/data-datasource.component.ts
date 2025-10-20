import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AttributeValue } from '@rollthecloudinc/attributes';

@Component({
    selector: 'classifieds-ui-data-datasource',
    template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-data-source-form formControlName="settings" [settings]="settings"></classifieds-ui-data-source-form></ng-container>`,
    standalone: false
})
export class DataDatasourceComponent {
  @Input() settings: Array<AttributeValue> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}