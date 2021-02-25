import { Component, OnInit, Input, TemplateRef, Optional } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { LayoutRendererBaseComponent } from 'panels'

@Component({
  selector: 'classifieds-ui-flex-layout-renderer',
  templateUrl: './flex-layout-renderer.component.html',
  // styleUrls: ['./gridless-layout-renderer.component.scss']
})
export class FlexLayoutRendererComponent extends LayoutRendererBaseComponent implements OnInit {

  constructor(@Optional() public controlContainer: ControlContainer) { 
    super(controlContainer);
  }

  ngOnInit(): void {
  }

}