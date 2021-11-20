import { Component, OnInit } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'classifieds-ui-formly-field-wrapper',
  templateUrl: './formly-field-wrapper.component.html',
  styleUrls: ['./formly-field-wrapper.component.scss']
})
export class FormlyFieldWrapperComponent extends FieldWrapper implements OnInit {

  get panelStateAncestory(): Array<number> {
    return [ ...(this.field as any).panelAncestory, +this.field.parent.key, (this.field as any).indexPosition ];
  }

  ngOnInit() {
    this.formControl.valueChanges.subscribe(v => {
      console.log(`wrapper | ${this.panelStateAncestory.join(',')}`, v);
    });
  }

}