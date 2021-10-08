import { Component } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'classifieds-ui-rest-datasource',
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-rest-source-form formControlName="settings"></classifieds-ui-rest-source-form></ng-container>`,
})
export class RestDatasourceComponent {
  constructor(
    public controlContainer: ControlContainer
  ) {}
}