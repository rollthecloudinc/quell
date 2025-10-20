import { Component, Input } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { Rest } from '../../models/rest.models';

@Component({
    selector: 'classifieds-ui-rest-datasource',
    template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-rest-source-form formControlName="settings" [restSource]="restSource" [contexts]="contexts"></classifieds-ui-rest-source-form></ng-container>`,
    standalone: false
})
export class RestDatasourceComponent {
  @Input() set settings(settings: Array<AttributeValue>) {
    this.restSource = settings ? new Rest(this.attributeSerializer.deserializeAsObject(settings)) : undefined;
  }
  @Input() contexts: Array<string> = [];
  restSource: Rest;
  constructor(
    private attributeSerializer: AttributeSerializerService,
    public controlContainer: ControlContainer
  ) {}
  /*@Input() settings: Array<AttributeValue> = [];
  constructor(
    public controlContainer: ControlContainer
  ) {}*/
}