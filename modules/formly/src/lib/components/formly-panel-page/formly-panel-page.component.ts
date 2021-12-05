import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { PanelPage } from 'panels';

@Component({
  selector: 'classifieds-formly-panel-page',
  templateUrl: './formly-panel-page.component.html'
})
export class FormlyPanelPageComponent extends FieldType implements OnInit, AfterViewInit {

  get panelPage(): PanelPage {
    return (this.field as any).panelPage;
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    // temporary fix for https://github.com/angular/material2/issues/6728
    // (<any> this.autocomplete)._formField = this.formField;
  }

}
