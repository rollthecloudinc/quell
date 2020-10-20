import { Component, OnInit, ContentChild, TemplateRef, ElementRef, ViewChildren, QueryList, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { SplitAreaDirective } from 'angular-split';

@Component({
  selector: 'classifieds-ui-split-layout',
  templateUrl: './split-layout.component.html',
  styleUrls: ['./split-layout.component.scss']
})
export class SplitLayoutComponent implements OnInit  {

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

  rows = 0;
  sizes: Array<Array<number>> = [];

  @ContentChild('gridItemActions') gridItemActionsTmpl: TemplateRef<any>;
  @ContentChild('innerGridItem') innerGridItemTmpl: TemplateRef<any>;
  @ContentChild('extraActions') extraActionsTmpl: TemplateRef<any>;

  //@ViewChild(GridsterComponent) gridster: GridsterComponent;
  @ViewChild('mainControls') mainControls: ElementRef;

  @ViewChildren('itemHeader') itemHeaders: QueryList<ElementRef>;

  @ViewChildren(SplitAreaDirective) splitAreas: QueryList<SplitAreaDirective>;

  get totalRows(): number {
    return this.dashboard.length == 0 ? 0 : this.dashboard.reduce<number>((p, c) => c.y > p ? c.y : p, 0) + 1;
  }

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    if(this.dashboard.length === 0) {
      this.addRow();
    } else {
      for(let i = 0; i < this.totalRows; i++) {
        const totalColumns = this.totalColumns(i);
        this.sizes.push([]);
        for(let j = 0; j < totalColumns; j++) {
          const index = this.itemIndex(i, j);
          this.sizes[i].push(this.dashboard[index].cols);
        }
      }
    }
  }

  removeRow(rIndex: number) {
    const idx = this.dashboard.reduce<Array<number>>((p, c, i) => [ ...p, ...(c.y === rIndex ? [i] : []) ], []);
    let len = idx.length;
    let offset = 0;
    for(let i = 0; i < len; i++) {
      this.dashboard.splice(idx[i] - offset, 1);
      offset++;
      this.itemRemoved.emit(idx[i]);
    }
    len = this.dashboard.length;
    for(let i = 0; i < len; i++) {
      if(this.dashboard[i].y > rIndex) {
        this.dashboard[i].y = this.dashboard[i].y - 1;
      }
    }
  }

  removeColumn(rIndex: number, cIndex: number) {
    const index = this.itemIndex(rIndex, cIndex);
    this.dashboard.splice(index, 1);
    this.itemRemoved.emit(index);
  }

  addRow() {
    this.sizes.push([]);
    this.addColumn(this.totalRows === 0 ? 0 : this.totalRows);
    this.itemAdded.emit();
  }

  addColumn(rowIndex: number) {
    const totalColumns = this.totalColumns(rowIndex);
    const size = totalColumns === 0 ? 100 : 100 / (totalColumns + 1);
    this.sizes[rowIndex][totalColumns] = size;
    this.dashboard.push({cols: size, rows: 1, y: rowIndex, x: totalColumns });
    this.itemAdded.emit();
    setTimeout(() => this.resetGutter());
  }

  dragEnd(rowIndex: number, {sizes}) {
    const len = sizes.length;
    this.sizes[rowIndex] = [ ...sizes ];
    for(let i = 0; i < len; i++) {
      if(this.dashboard[i].y === rowIndex) {
        this.dashboard[i].cols = sizes[i];
      }
    }
  }

  itemIndex(rIndex: number, cIndex: number): any {
    return this.dashboard.findIndex(c => c.y === rIndex && c.x === cIndex);
  }

  itemSize(rIndex: number, cIndex: number): number {
    return this.dashboard[this.itemIndex(rIndex, cIndex)].cols;
  }

  totalColumns(rowIndex: number): number {
    return this.dashboard.reduce<number>((p, c) => c.y === rowIndex ? p + 1 : p, 0);
  }

  resetGutter() {
    this.el.nativeElement.querySelectorAll('.as-split-gutter').forEach(e => {
      e.style.height = 'auto';
    });
  }

}
