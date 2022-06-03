import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AttributeValue } from '@rollthecloudinc/attributes';

@Component({
  selector: 'classifieds-ui-context-datasource',
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-context-datasource-form formControlName="settings" [contexts]="contexts" [settings]="settings"></classifieds-ui-context-datasource-form></ng-container>`,
})
export class ContextDatasourceComponent {
  @Input() contexts: Array<string> = [];
  @Input() settings: Array<AttributeValue> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}