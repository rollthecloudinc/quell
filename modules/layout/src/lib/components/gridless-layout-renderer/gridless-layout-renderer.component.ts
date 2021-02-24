import { Component, OnInit, Input, TemplateRef, Optional } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'classifieds-ui-gridless-layout-renderer',
  templateUrl: './gridless-layout-renderer.component.html',
  // styleUrls: ['./gridless-layout-renderer.component.scss']
})
export class GridlessLayoutRendererComponent implements OnInit {

  @Input()
  displayMainControls = false;

  @Input()
  displayItemHeader = false;

  @Input()
  renderPanelTpl: TemplateRef<any>;

  constructor(@Optional() public controlContainer: ControlContainer) { }

  ngOnInit(): void {
  }

}