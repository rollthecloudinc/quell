import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AttributeValue } from '@ng-druid/attributes';

@Component({
  selector: 'classifieds-ui-form-datasource',
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-form-datasource-form formControlName="settings" [settings]="settings"></classifieds-ui-form-datasource-form></ng-container>`,
})
export class FormDatasourceComponent {
  @Input() settings: Array<AttributeValue> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}