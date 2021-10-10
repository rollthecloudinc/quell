import { Component } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'classifieds-ui-transform-select',
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-select-source-form formControlName="settings"></classifieds-ui-select-source-form></ng-container>`,
})
export class TransformSelectComponent {
  constructor(
    public controlContainer: ControlContainer
  ) {}
}