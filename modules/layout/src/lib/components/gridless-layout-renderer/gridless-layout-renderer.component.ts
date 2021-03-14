import { Component, OnInit, Input, TemplateRef, Optional } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { LayoutRendererBaseComponent } from 'panels';

@Component({
  selector: 'classifieds-ui-gridless-layout-renderer',
  templateUrl: './gridless-layout-renderer.component.html',
  styleUrls: ['./gridless-layout-renderer.component.scss']
})
export class GridlessLayoutRendererComponent extends LayoutRendererBaseComponent implements OnInit {

  constructor(@Optional() public controlContainer: ControlContainer) { 
    super(controlContainer);
  }

  ngOnInit(): void {
  }

}