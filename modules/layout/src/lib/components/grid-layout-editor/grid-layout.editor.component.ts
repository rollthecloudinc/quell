import { Component, OnInit, Input, TemplateRef, ViewChild } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { DisplayGrid, GridsterConfig, GridsterItem, GridsterItemComponentInterface, GridType } from 'angular-gridster2';
import { LayoutEditorBaseComponent, GridItem } from '@rollthecloudinc/panels';
import { GridLayoutComponent } from '../grid-layout/grid-layout.component';

@Component({
    selector: 'classifieds-ui-grid-layout-editor',
    templateUrl: './grid-layout-editor.component.html',
    styleUrls: ['./grid-layout-editor.component.scss'],
    standalone: false
})
export class GridLayoutEditorComponent extends LayoutEditorBaseComponent implements OnInit {

  options: GridsterConfig = {
    gridType: GridType.Fit,
    displayGrid: DisplayGrid.Always,
    pushItems: true,
    draggable: {
      enabled: true
    },
    resizable: {
      enabled: true
    },
    mobileBreakpoint: 0,
    itemChangeCallback: (item: GridsterItem, itemComponent: GridsterItemComponentInterface) => {
      // console.log(item);
    },
    itemInitCallback: (item: GridsterItem, itemComponent: GridsterItemComponentInterface) => {
      if(this.nested && item.y !== 0) {
        const matchIndex = this.gridLayout.grid.findIndex(g => g.x === item.x && g.y === item.y && g.cols === item.cols && g.rows === item.rows);
        if(this.editor.panelPanes(matchIndex).length === 0) {
          this.gridLayout.setItemContentHeight(matchIndex, 200);
        } else {
        }
      }
    },
  };

  @ViewChild(GridLayoutComponent, {static: false}) gridLayout: GridLayoutComponent;

  get gridItems(): Array<GridItem> {
    return this.gridLayout.grid.map((gi, i) => ({ ...gi, weight: i }));
  }

  constructor(public controlContainer: ControlContainer) { 
    super(controlContainer);
  }

  ngOnInit(): void {
  }

}