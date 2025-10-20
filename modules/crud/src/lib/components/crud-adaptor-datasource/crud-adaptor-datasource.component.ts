import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AttributeValue } from '@rollthecloudinc/attributes';

@Component({
    selector: 'classifieds-ui-crud-adaptor-datasource',
    template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-crud-adaptor-datasource-form formControlName="settings" [settings]="settings" [contexts]="contexts"></classifieds-ui-crud-adaptor-datasource-form></ng-container>`,
    standalone: false
})
export class CrudAdaptorDatasourceComponent {
  @Input() settings: Array<AttributeValue> = [];
  @Input() contexts: Array<string> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}