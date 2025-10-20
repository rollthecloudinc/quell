import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AttributeValue } from '@rollthecloudinc/attributes';

@Component({
    selector: 'classifieds-ui-entity-datasource',
    template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-entity-datasource-form formControlName="settings" [settings]="settings" [contexts]="contexts"></classifieds-ui-entity-datasource-form></ng-container>`,
    standalone: false
})
export class EntityDatasourceComponent {
  @Input() settings: Array<AttributeValue> = [];
  @Input() contexts: Array<string> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}
}