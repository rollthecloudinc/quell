import { Component, OnInit, Input, TemplateRef, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, ControlContainer } from '@angular/forms';
import { LayoutEditorBaseComponent, GridItem } from 'panels';

@Component({
  selector: 'classifieds-ui-split-layout-editor',
  templateUrl: './split-layout-editor.component.html',
  styleUrls: ['./split-layout-editor.component.scss']
})
export class SplitLayoutEditorComponent extends LayoutEditorBaseComponent implements OnInit, OnChanges {

  get gridItems(): Array<GridItem> {
    return this.dashboard.map((gi, i) => ({ ...gi, cols: Math.floor(gi.cols), weight: i }));
  }

  constructor(public controlContainer: ControlContainer) { 
    super(controlContainer);
  }

  ngOnInit(): void {
    let y = 'x'
  }

  ngOnChanges(changes: SimpleChanges) {
    let x = 'y';
  }

  debug(i, j) {
    let x = 'y';
    return 1;
  }

  panelPaneControls(i: number): Array<AbstractControl> {
    return this.editor.panelPanes(i).controls;
  }

}