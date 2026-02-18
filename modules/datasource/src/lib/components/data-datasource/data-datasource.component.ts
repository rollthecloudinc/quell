import { Component, Input, ViewChild } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { DataSourceFormComponent } from '../data-source-form/data-source-form.component';
import { Fillable } from '@rollthecloudinc/utils';

@Component({
    selector: 'classifieds-ui-data-datasource',
    template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-data-source-form formControlName="settings" [settings]="settings"></classifieds-ui-data-source-form></ng-container>`,
    standalone: false
})
export class DataDatasourceComponent implements Fillable<{}> {
  @ViewChild(DataSourceFormComponent) datasourceForm: DataSourceFormComponent
  @Input() settings: Array<AttributeValue> = [];
  fillContent: any;
  constructor(
    public controlContainer: ControlContainer
  ) {}
  fill() {
    this.datasourceForm.fill()
  }
  setFillContent(content: any) {
    this.datasourceForm.setFillContent(content)
  }
}