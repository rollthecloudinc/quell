import { Component } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'classifieds-ui-data-datasource',
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-data-source-form formControlName="settings"></classifieds-ui-data-source-form></ng-container>`,
})
export class DataDatasourceComponent {
  constructor(
    public controlContainer: ControlContainer
  ) {}
}