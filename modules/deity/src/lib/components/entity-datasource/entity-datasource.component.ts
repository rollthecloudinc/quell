import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AttributeValue } from 'attributes';

@Component({
  selector: 'classifieds-ui-entity-datasource',
  template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-entity-datasource-form formControlName="settings" [settings]="settings"></classifieds-ui-entity-datasource-form></ng-container>`,
})
export class EntityDatasourceComponent {
  @Input() settings: Array<AttributeValue> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}