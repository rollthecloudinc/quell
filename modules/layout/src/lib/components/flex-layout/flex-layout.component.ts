import { Component, OnInit, Input, ContentChild, TemplateRef, HostBinding } from '@angular/core';
import { LayoutSetting } from '@rollthecloudinc/panels';
import { AttributeMatcherService } from '@rollthecloudinc/attributes';

@Component({
    selector: 'classifieds-ui-flex-layout',
    templateUrl: './flex-layout.component.html',
    styleUrls: ['./flex-layout.component.scss'],
    standalone: false
})
export class FlexLayoutComponent implements OnInit {

  @Input()
  dashboard: any[] = [];

  @Input()
  layoutSetting = new LayoutSetting();

  @Input()
  rowSettings: Array<LayoutSetting> = [];

  @Input()
  columnSettings: Array<LayoutSetting> = [];

  @ContentChild('innerGridItem') innerGridItemTmpl!: TemplateRef<any>;

  constructor(
    private attributeMatcher: AttributeMatcherService
  ) { }

  ngOnInit(): void {
    console.log('dashboard', this.dashboard);
  }

  // --- Layout Calculations ---

  get totalRows(): number {
    return this.dashboard.length === 0 
      ? 0 
      : this.dashboard.reduce<number>((p, c) => c.y > p ? c.y : p, 0) + 1;
  }

  /**
   * Replaces [fxLayout]="direction"
   */
  get direction(): string {
    const d = this.attributeMatcher.getComputedValue('direction', this.layoutSetting?.settings || []);
    return d && (d.trim() === 'column' || d.trim() === 'row') ? d.trim() : 'column';
  }

  /**
   * Replaces fxLayoutGap
   */
  get layoutGap(): string {
    const gap = this.attributeMatcher.getComputedValue('gap', this.layoutSetting?.settings || []);
    return gap ? gap.trim() : '0px';
  }

  // --- Row Helpers ---

  totalColumns(rowIndex: number): number {
    return this.dashboard.reduce<number>((p, c) => c.y === rowIndex ? p + 1 : p, 0);
  }

  rowDirection(index: number): string {
    const settings = this.rowSettings?.[index]?.settings || [];
    const d = this.attributeMatcher.getComputedValue('direction', settings);
    return d && (d.trim() === 'column' || d.trim() === 'row') ? d.trim() : 'row';
  }

  /**
   * Generates a valid CSS flex shorthand string (e.g., "1 1 auto")
   * Replaces [fxFlex]="rowFlex(i)"
   */
  rowFlex(index: number): string {
    const settings = this.rowSettings?.[index]?.settings || [];
    const attributes = ['flexGrow', 'flexShrink', 'flexBasis'];
    
    const values = attributes
      .map(n => this.attributeMatcher.getComputedValue(n, settings))
      .map(v => (v !== undefined && v !== null && v !== '') ? v.toString().trim() : '');

    const validValues = values.filter(v => v !== '');
    
    // Default to '1 1 auto' if no settings are found to maintain 'fill' behavior
    return validValues.length > 0 ? validValues.join(' ') : '1 1 auto';
  }

  rowGap(index: number): string {
    const settings = this.rowSettings?.[index]?.settings || [];
    const gap = this.attributeMatcher.getComputedValue('gap', settings);
    return gap ? gap.trim() : '0px';
  }

  // --- Item Helpers ---

  itemIndex(rIndex: number, cIndex: number): number {
    return this.dashboard.findIndex(c => c.y === rIndex && c.x === cIndex);
  }

  /**
   * Replaces [ngStyle]="gridItemInnerStyles(i, j)"
   */
  gridItemInnerStyles(row: number, column: number): { [key: string]: string } {
    const index = this.itemIndex(row, column);
    const settings = this.columnSettings?.[index]?.settings || [];
    const heightValue = this.attributeMatcher.getComputedValue('height', settings);
    
    return { 
      height: this.calculateHeight(heightValue) 
    };
  }

  calculateHeight(v?: any): string {
    const trimmed = (v !== undefined && v !== null) ? v.toString().trim() : 'auto';
    return trimmed === '' ? 'auto' : trimmed;
  }

  getColFlex(row: number, col: number): string {
    const index = this.itemIndex(row, col);
    const item = this.dashboard[index];
    
    if (!item || item.cols === undefined) return '1 1 auto';

    // Ensure we use the percentage value from the dashboard
    // flex: grow shrink basis
    return `0 0 ${item.cols}%`;
  }
}