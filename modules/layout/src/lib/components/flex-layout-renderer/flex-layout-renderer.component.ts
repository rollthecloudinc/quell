import { Component, OnInit, Input, TemplateRef, Optional } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import { LayoutRendererBaseComponent } from 'panels'

@Component({
  selector: 'classifieds-ui-flex-layout-renderer',
  templateUrl: './flex-layout-renderer.component.html',
  // styleUrls: ['./gridless-layout-renderer.component.scss']
})
export class FlexLayoutRendererComponent extends LayoutRendererBaseComponent implements OnInit {

  get isForm(): boolean {
    return this.controlContainer && (this.controlContainer.control as FormGroup).contains('panels') ? true : false;
  }

  constructor(@Optional() public controlContainer: ControlContainer) { 
    super(controlContainer);
  }

  ngOnInit(): void {
  }

}