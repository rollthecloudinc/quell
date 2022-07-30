import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
// import { AttributeValue } from '@rollthecloudinc/attributes';
@Component({
  selector: 'druid-ordain-validation-params-editor',
  template: `<ng-container [formGroup]="controlContainer.control"><druid-ordain-validation-params-editor-form formControlName="settings" [contexts]="contexts"></druid-ordain-validation-params-editor-form></ng-container>`,
})
export class ValidationParamsEditorComponent {
  //@Input() settings: Array<AttributeValue> = [];
  @Input() contexts: Array<string> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}