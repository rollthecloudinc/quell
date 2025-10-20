import { Component, OnInit, ContentChild, TemplateRef, ElementRef, ViewChildren, QueryList, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SplitAreaDirective } from 'angular-split';
import { LayoutSetting } from '@rollthecloudinc/panels';
import { filter, switchMap } from 'rxjs/operators';
import { LayoutDialogComponent } from '../layout-dialog/layout-dialog.component';
import { LayoutPluginManager } from '../../services/layout-plugin-manager.service';
import { AttributeValue } from '@rollthecloudinc/attributes';
@Component({
    selector: 'classifieds-ui-split-layout',
    templateUrl: './split-layout.component.html',
    styleUrls: ['./split-layout.component.scss'],
    host: {
        "[class.is-nested]": "nested"
    },
    standalone: false
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

  @Input()
  nested = false;

  @Input() layoutSetting: LayoutSetting;
  @Output() layoutSettingChange = new EventEmitter<LayoutSetting>();

  @Input() rowSettings: Array<LayoutSetting>;
  @Output() rowSettingsChange = new EventEmitter<Array<LayoutSetting>>();

  @Input() columnSettings: Array<LayoutSetting>;
  @Output() columnSettingsChange = new EventEmitter<Array<LayoutSetting>>();

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

  constructor(
    private el: ElementRef,
    private dialog: MatDialog,
    private lpm: LayoutPluginManager
  ) { }

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
      if (this.totalRows !== this.rowSettings.length && this.rowSettings.length === 0) {
        const settings = [];
        for (let i = 0; i < this.totalRows; i++) {
          settings.push(new LayoutSetting());
        }
        this.rowSettings = settings;
        this.rowSettingsChange.emit(this.rowSettings);
      }
      let totalCols = 0;
      for (let i = 0; i < this.totalRows; i++) {
        totalCols += this.totalColumns(i);
      }
      if (totalCols !== this.columnSettings.length && this.columnSettings.length === 0) {
        const settings = [];
        for (let i = 0; i < this.totalRows; i++) {
          for (let j = 0; j < this.totalColumns(i); j++) {
            settings.push(new LayoutSetting());
          }
        }
        this.columnSettings = settings;
        this.columnSettingsChange.emit(this.columnSettings);
      }
    }
  }

  removeRow(rIndex: number) {
    const idx = this.dashboard.reduce<Array<number>>((p, c, i) => [ ...p, ...(c.y === rIndex ? [i] : []) ], []);
    let len = idx.length;
    let offset = 0;
    for(let i = 0; i < len; i++) {
      this.dashboard.splice(idx[i] - offset, 1);
      this.rowSettings.splice(rIndex, 1);
      offset++;
      this.itemRemoved.emit(idx[i]);
      this.rowSettingsChange.emit(this.rowSettings);
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

  removeColumn2(index: number) {
    this.dashboard.splice(index, 1);
    this.itemRemoved.emit(index);
  }

  addRow() {
    this.sizes.push([]);
    this.rowSettings = [ ...this.rowSettings.map(s => new LayoutSetting(s)), new LayoutSetting() ];
    this.addColumn(this.totalRows === 0 ? 0 : this.totalRows);
    this.rowSettingsChange.emit(this.rowSettings);
    // @todo: Given various tests this results in duplicate columns in this layout.
    // this.itemAdded.emit();
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
    const len = this.dashboard.length;
    let counter = 0;
    this.sizes[rowIndex] = [ ...sizes ];
    const newDash = this.dashboard.map(o => ({ ...o }));
    for(let i = 0; i < len; i++) {
      if(this.dashboard[i].y === rowIndex) {
        newDash[i].cols = sizes[counter];
        counter += 1;
      }
    }
    this.dashboard = newDash;
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

  settingValues(type: string, index?: number): Array<AttributeValue> {
    switch(type) {
      case 'column':
        return this.columnSettings[index].settings;
      case 'row':
        return this.rowSettings[index].settings;
      case 'global':
        return this.layoutSetting.settings;
      default:
        return [];
    }
  }

  layoutSettings(type: string, index?: number) {
    this.lpm.getPlugin('split').pipe(
      switchMap(layout => this.dialog.open(LayoutDialogComponent, { data: { layout, type, settingValues: this.settingValues(type, index) } }).afterClosed()),
      filter(settings => !!settings)
    ).subscribe(settings => {
      switch(type) {
        case 'column':
          this.columnSettings = this.columnSettings.map((v, i) => i === index ? new LayoutSetting({ settings: settings.map(s => new AttributeValue(s))}) : new LayoutSetting(v));
          console.log(this.columnSettings);
          this.columnSettingsChange.emit(this.columnSettings);
          break;
        case 'row':
          this.rowSettings = this.rowSettings.map((v, i) => i === index ? new LayoutSetting({ settings: settings.map(s => new AttributeValue(s))}) : new LayoutSetting(v));
          console.log(this.rowSettings);
          this.rowSettingsChange.emit(this.rowSettings);
          break;
        case 'global':
          this.layoutSetting = new LayoutSetting({ settings: settings.map(s => new AttributeValue(s)) });
          this.layoutSettingChange.emit(this.layoutSetting);
          break;
        default:
      }
    })
  }

}
