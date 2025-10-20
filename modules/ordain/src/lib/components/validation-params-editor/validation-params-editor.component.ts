import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { ValidationValidatorSettings } from '../../models/validation.models';
@Component({
    selector: 'druid-ordain-validation-params-editor',
    template: `<ng-container [formGroup]="controlContainer.control"><druid-ordain-validation-params-editor-form formControlName="paramSettings" [settings]="settings" [contexts]="contexts"></druid-ordain-validation-params-editor-form></ng-container>`,
    standalone: false
})
export class ValidationParamsEditorComponent {
  @Input() settings: Array<ValidationValidatorSettings> = [];
  @Input() contexts: Array<string> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}