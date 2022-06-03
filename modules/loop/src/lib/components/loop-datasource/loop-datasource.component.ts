import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AttributeValue } from '@rollthecloudinc/attributes';

@Component({
  selector: 'classifieds-ui-loop-datasource',
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-loop-datasource-form formControlName="settings" [settings]="settings" [contexts]="contexts"></classifieds-ui-loop-datasource-form></ng-container>`,
})
export class LoopDatasourceComponent {
  @Input() settings: Array<AttributeValue> = [];
  @Input() contexts: Array<string> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}