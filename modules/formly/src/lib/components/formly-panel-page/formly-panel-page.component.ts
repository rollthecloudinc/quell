import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { PanelPage } from '@rollthecloudinc/panels';

@Component({
  selector: 'classifieds-formly-panel-page',
  templateUrl: './formly-panel-page.component.html'
})
export class FormlyPanelPageComponent extends FieldType implements OnInit, AfterViewInit {

  panelPage: PanelPage;
  ancestoryWithSelf: Array<number> = [];

  ngOnInit() {
    super.ngOnInit();
    this.panelPage = (this.field as any).panelpage;
    this.ancestoryWithSelf = [ ...(this.field as any).panelAncestory, +this.field.parent.parent.key, 0, (this.field as any).indexPosition ];
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    // temporary fix for https://github.com/angular/material2/issues/6728
    // (<any> this.autocomplete)._formField = this.formField;
  }

}
