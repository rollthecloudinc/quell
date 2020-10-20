import { Component, OnInit, EventEmitter, Output, ContentChild, TemplateRef, Input, ViewChild, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { DisplayGrid, GridsterConfig, GridType, GridsterItem, GridsterComponent } from 'angular-gridster2';

@Component({
  selector: 'classifieds-ui-grid-layout',
  templateUrl: './grid-layout.component.html',
  styleUrls: ['./grid-layout.component.scss']
})
export class GridLayoutComponent implements OnInit {

  @Output()
  itemAdded = new EventEmitter();

  @Output()
  itemRemoved = new EventEmitter<number>();

  @Input()
  dashboard = []

  @Input()
  displayMainControls = true;

  @Input()
  displayItemHeader = true;

  @Input()
  options: GridsterConfig;

  itemHeights = [];
  gridHeight: number;

  rows = 0;

  get grid() {
    return this.dashboard;
  }

  @ContentChild('gridItemActions') gridItemActionsTmpl: TemplateRef<any>;
  @ContentChild('innerGridItem') innerGridItemTmpl: TemplateRef<any>;
  @ContentChild('extraActions') extraActionsTmpl: TemplateRef<any>;

  @ViewChild(GridsterComponent) gridster: GridsterComponent;
  @ViewChild('mainControls') mainControls: ElementRef;

  @ViewChildren('itemHeader') itemHeaders: QueryList<ElementRef>;

  get cumulativeHeight(): number {
    const rows = [];
    this.heightsMatrix.forEach(m => {
      rows.push(this.itemHeights.reduce((p, c) => c > p ? c : p));
    });
    return rows.reduce((p, c) => p + c);
  }

  get heightsMatrix() {
    return this.dashboard.reduce<Array<Array<number>>>((p, c, i) => {
      p[c.y] = p[c.y] !== undefined ? [ ...p[c.y], this.itemHeights[i] ] : [ this.itemHeights[i] ];
      return p;
    }, []);
  }

  constructor() {}

  ngOnInit(): void {}

  removeItem(index: number) {
    this.dashboard.splice(index, 1);
    this.itemHeights.splice(index, 1);
    this.itemRemoved.emit(index);
  }

  addColumn() {
    console.log('add column grid');
    this.dashboard.push({cols: 1, rows: 1, y: 0, x: this.dashboard.length});
    // this.itemHeights.push(undefined);
    this.itemAdded.emit();
  }

  addRow() {
    this.dashboard.push({cols: 1, rows: 1, y: this.rows++, x: 0});
    // this.itemHeights.push(undefined);
    this.itemAdded.emit();
  }

  setItemContentHeight(index: number, height: number) {
    this.itemHeights[index] = height + ( this.displayItemHeader ? this.itemHeaderHeight(index) : 0 );
    // console.log(`item height item: ${height} | header: ${this.itemHeaderHeight(index)}`);
    this.refreshGridHeight();
  }

  refreshGridHeight() {
    this.gridster.calculateLayout();
    // console.log(`main controls: ${this.mainControls.nativeElement.offsetHeight} | cumulative height: ${this.cumulativeHeight}`);
    this.gridHeight = this.cumulativeHeight /* + ( this.displayMainControls ? this.mainControls.nativeElement.offsetHeight : 0 )*/ + (this.gridster.rows * 16);
    // console.log(`adjust height: ${this.gridHeight}`);
  }

  itemHeaderHeight(index: number) {
    return this.itemHeaders.find((i, i2) => i2 === index).nativeElement.offsetHeight;
  }

}
