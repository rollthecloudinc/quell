import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { LayoutEditorBaseComponent, GridItem } from '@rollthecloudinc/panels';

@Component({
  selector: 'classifieds-ui-split-layout-editor',
  templateUrl: './split-layout-editor.component.html',
  styleUrls: ['./split-layout-editor.component.scss']
})
export class SplitLayoutEditorComponent extends LayoutEditorBaseComponent implements OnInit {

  get gridItems(): Array<GridItem> {
    return this.dashboard.map((gi, i) => ({ ...gi, cols: Math.floor(gi.cols), weight: i }));
  }

  constructor(public controlContainer: ControlContainer) { 
    super(controlContainer);
  }

  ngOnInit(): void {
  }

}