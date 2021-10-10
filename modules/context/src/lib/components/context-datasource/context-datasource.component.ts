import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'classifieds-ui-context-datasource',
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-context-datasource-form formControlName="settings" [contexts]="contexts"></classifieds-ui-context-datasource-form></ng-container>`,
})
export class ContextDatasourceComponent {
  @Input() contexts: Array<string> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}