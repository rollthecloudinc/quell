import {
  Component,
  OnInit,
  AfterViewInit,
  ContentChild,
  TemplateRef,
  ElementRef,
  ViewChildren,
  QueryList,
  ViewChild,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { LayoutSetting } from '@rollthecloudinc/panels';
import { filter, switchMap } from 'rxjs/operators';
import { LayoutDialogComponent } from '../layout-dialog/layout-dialog.component';
import { LayoutPluginManager } from '../../services/layout-plugin-manager.service';
import { AttributeValue } from '@rollthecloudinc/attributes';

@Component({
  selector: 'classifieds-ui-split-layout',
  templateUrl: './split-layout.component.html',
  styleUrls: ['./split-layout.component.scss'],
  host: { '[class.is-nested]': 'nested' },
  standalone: false
})
export class SplitLayoutComponent implements OnInit, AfterViewInit {

  // -------------------------------------------------------------------
  // Inputs / Outputs
  // -------------------------------------------------------------------
  @Output() itemAdded = new EventEmitter();
  @Output() itemRemoved = new EventEmitter<number>();

  @Input() dashboard = [];
  @Input() displayMainControls = true;
  @Input() displayItemHeader = true;
  @Input() nested = false;

  @Input() layoutSetting: LayoutSetting;
  @Output() layoutSettingChange = new EventEmitter<LayoutSetting>();

  @Input() rowSettings: LayoutSetting[] = [];
  @Output() rowSettingsChange = new EventEmitter<LayoutSetting[]>();

  @Input() columnSettings: LayoutSetting[] = [];
  @Output() columnSettingsChange = new EventEmitter<LayoutSetting[]>();

  sizes: number[][] = [];

  // -------------------------------------------------------------------
  // Template refs
  // -------------------------------------------------------------------
  @ContentChild('gridItemActions') gridItemActionsTmpl: TemplateRef<any>;
  @ContentChild('innerGridItem') innerGridItemTmpl: TemplateRef<any>;
  @ContentChild('extraActions') extraActionsTmpl: TemplateRef<any>;

  @ViewChild('mainControls') mainControls: ElementRef;

  @ViewChildren('itemHeader') itemHeaders: QueryList<ElementRef>;

  constructor(
    private el: ElementRef,
    private dialog: MatDialog,
    private lpm: LayoutPluginManager
  ) {}

  // -------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------
  get totalRows(): number {
    if (!this.dashboard.length) return 0;
    return Math.max(...this.dashboard.map(i => i.y)) + 1;
  }

  totalColumns(row: number): number {
    return this.dashboard.filter(i => i.y === row).length;
  }

  // -------------------------------------------------------------------
  // Utility (for template migration)
  // -------------------------------------------------------------------
  arrayFromNumber(n: number): number[] {
    return Array.from({ length: n });
  }

  // -------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------
  ngOnInit() {
    this.rebuildSizeMatrix();
    this.ensureInitialSettings();
  }

  ngAfterViewInit() {}

  // -------------------------------------------------------------------
  // Initialization helpers
  // -------------------------------------------------------------------
  private rebuildSizeMatrix() {
    this.sizes = [];

    for (let r = 0; r < this.totalRows; r++) {
      const items = this.dashboard
        .filter(i => i.y === r)
        .sort((a, b) => a.x - b.x);

      this.sizes[r] = items.map(i => i.cols);
    }
  }

  private ensureInitialSettings() {
    if (!this.rowSettings.length) {
      this.rowSettings = Array.from(
        { length: this.totalRows },
        () => new LayoutSetting()
      );
      this.rowSettingsChange.emit(this.rowSettings);
    }

    if (!this.columnSettings.length) {
      this.columnSettings = this.dashboard.map(() => new LayoutSetting());
      this.columnSettingsChange.emit(this.columnSettings);
    }
  }

  // -------------------------------------------------------------------
  // Add row
  // -------------------------------------------------------------------
  addRow() {
    const rowIndex = this.totalRows;

    this.rowSettings.push(new LayoutSetting());
    this.rowSettingsChange.emit(this.rowSettings);

    this.sizes[rowIndex] = [];

    setTimeout(() => this.addColumn(rowIndex), 0);
  }

  // -------------------------------------------------------------------
  // Add column (equalize)
  // -------------------------------------------------------------------
  addColumn(rowIndex: number) {
    const items = this.dashboard.filter(i => i.y === rowIndex);
    const newCount = items.length + 1;
    const equal = 100 / newCount;

    // Equalize all existing
    items.forEach(i => (i.cols = equal));

    // Add new item
    this.dashboard.push({
      rows: 1,
      y: rowIndex,
      x: items.length,
      cols: equal,
      weight: items.length
    });

    // Update sizes array
    this.sizes[rowIndex] = Array.from({ length: newCount }, () => equal);

    this.dashboard = [...this.dashboard];
    this.itemAdded.emit();
  }

  // -------------------------------------------------------------------
  // Remove column (normalize proportionally)
  // -------------------------------------------------------------------
  removeColumn(row: number, col: number) {
    const index = this.itemIndex(row, col);
    if (index < 0) return;

    this.dashboard.splice(index, 1);
    this.itemRemoved.emit(index);

    const remaining = this.dashboard
      .filter(i => i.y === row)
      .sort((a, b) => a.x - b.x);

    if (!remaining.length) {
      this.removeRow(row);
      return;
    }

    // Proportional normalization
    const total = remaining.reduce((s, i) => s + i.cols, 0);

    remaining.forEach((item, idx) => {
      item.cols = (item.cols / total) * 100;
      item.x = idx;
    });

    this.finalizePercentages(remaining);
    this.sizes[row] = remaining.map(i => i.cols);

    this.dashboard = [...this.dashboard];
  }

  // -------------------------------------------------------------------
  // Remove column2 (by flat index)
  // -------------------------------------------------------------------
  removeColumn2(index: number) {
    const removed = this.dashboard[index];
    if (!removed) return;

    const row = removed.y;

    this.dashboard.splice(index, 1);
    this.itemRemoved.emit(index);

    const remaining = this.dashboard
      .filter(i => i.y === row)
      .sort((a, b) => a.x - b.x);

    if (!remaining.length) {
      this.removeRow(row);
      return;
    }

    const total = remaining.reduce((s, i) => s + i.cols, 0);
    remaining.forEach((item, idx) => {
      item.cols = (item.cols / total) * 100;
      item.x = idx;
    });

    this.finalizePercentages(remaining);
    this.sizes[row] = remaining.map(i => i.cols);

    this.dashboard = [...this.dashboard];
  }

  // -------------------------------------------------------------------
  // Remove row
  // -------------------------------------------------------------------
  removeRow(row: number) {
    this.dashboard = this.dashboard.filter(i => i.y !== row);

    // Shift row numbers down
    this.dashboard.forEach(item => {
      if (item.y > row) item.y--;
    });

    this.rowSettings.splice(row, 1);
    this.rowSettingsChange.emit(this.rowSettings);

    this.rebuildSizeMatrix();
  }

  // -------------------------------------------------------------------
  // Drag end (update internal sizes)
  // -------------------------------------------------------------------
  dragEnd(row: number, event: { sizes: number[] }) {
    const rowSizes = event.sizes;
    const items = this.dashboard
      .filter(i => i.y === row)
      .sort((a, b) => a.x - b.x);

    items.forEach((item, idx) => (item.cols = rowSizes[idx]));

    this.finalizePercentages(items);
    this.sizes[row] = items.map(i => i.cols);

    this.dashboard = [...this.dashboard];

    console.log('dashboard', this.dashboard);
  }

  // -------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------
  itemIndex(row: number, col: number): number {
    return this.dashboard.findIndex(i => i.y === row && i.x === col);
  }

  itemSize(row: number, col: number): number {
    const items = this.dashboard
      .filter(i => i.y === row)
      .sort((a, b) => a.x - b.x);
    return items[col]?.cols ?? 0;
  }

  private finalizePercentages(items: any[]) {
    this.normalizeToWholePercentages(items);
  }

  private normalizeToWholePercentages(items: any[]) {
    if (!items.length) return;

    // first convert to integers
    let intValues = items.map(i => Math.round(i.cols));

    // ensure sum = 100
    let sum = intValues.reduce((a, b) => a + b, 0);

    if (sum !== 100) {
      // adjust the last column to fix the sum
      intValues[intValues.length - 1] += (100 - sum);
    }

    // apply back to items
    intValues.forEach((val, i) => items[i].cols = val);
  }

  resetGutter() {
    this.el.nativeElement
      .querySelectorAll('.as-split-gutter')
      .forEach(e => (e.style.height = 'auto'));
  }

  // -------------------------------------------------------------------
  // Layout settings logic (unchanged)
  // -------------------------------------------------------------------
  settingValues(type: string, index?: number) {
    switch (type) {
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
    this.lpm
      .getPlugin('split')
      .pipe(
        switchMap(layout =>
          this.dialog.open(LayoutDialogComponent, {
            data: {
              layout,
              type,
              settingValues: this.settingValues(type, index)
            }
          }).afterClosed()
        ),
        filter(settings => !!settings)
      )
      .subscribe(settings => {
        switch (type) {
          case 'column':
            this.columnSettings = this.columnSettings.map((v, i) =>
              i === index
                ? new LayoutSetting({
                    settings: settings.map(s => new AttributeValue(s))
                  })
                : new LayoutSetting(v)
            );
            this.columnSettingsChange.emit(this.columnSettings);
            break;

          case 'row':
            this.rowSettings = this.rowSettings.map((v, i) =>
              i === index
                ? new LayoutSetting({
                    settings: settings.map(s => new AttributeValue(s))
                  })
                : new LayoutSetting(v)
            );
            this.rowSettingsChange.emit(this.rowSettings);
            break;

          case 'global':
            this.layoutSetting = new LayoutSetting({
              settings: settings.map(s => new AttributeValue(s))
            });
            this.layoutSettingChange.emit(this.layoutSetting);
            break;
        }
      });
  }
}