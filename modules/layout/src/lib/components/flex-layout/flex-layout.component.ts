import { Component, OnInit, Input, ContentChild, TemplateRef } from '@angular/core';
import { LayoutSetting } from 'panels';
import { AttributeMatcherService } from '@ng-druid/attributes';

@Component({
  selector: 'classifieds-ui-flex-layout',
  templateUrl: './flex-layout.component.html',
  styleUrls: ['./flex-layout.component.scss']
})
export class FlexLayoutComponent implements OnInit {

  @Input()
  dashboard = []

  @Input()
  layoutSetting = new LayoutSetting();

  @Input()
  rowSettings: Array<LayoutSetting> = [];

  @Input()
  columnSettings: Array<LayoutSetting> = [];

  @ContentChild('innerGridItem') innerGridItemTmpl: TemplateRef<any>;

  get totalRows(): number {
    return this.dashboard.length == 0 ? 0 : this.dashboard.reduce<number>((p, c) => c.y > p ? c.y : p, 0) + 1;
  }

  get direction(): string {
    const d = this.attributeMatcher.getComputedValue('direction', this.layoutSetting ? this.layoutSetting.settings : []);
    return d && (d.trim() === 'column' || d.trim() === 'row') ? d : 'column';
  }

  constructor(
    private attributeMatcher: AttributeMatcherService
  ) { }

  ngOnInit(): void {
    console.log(this.dashboard);
  }

  itemIndex(rIndex: number, cIndex: number): any {
    return this.dashboard.findIndex(c => c.y === rIndex && c.x === cIndex);
  }

  totalColumns(rowIndex: number): number {
    return this.dashboard.reduce<number>((p, c) => c.y === rowIndex ? p + 1 : p, 0);
  }

  rowDirection(index: number): string {
    const d = this.attributeMatcher.getComputedValue('direction', this.rowSettings && this.rowSettings[index] ? this.rowSettings[index].settings : []);
    return d && (d.trim() === 'column' || d.trim() === 'row') ? d : 'row';
  }

  rowFlex(index: number): string {
    const attributes = ['flexGrow', 'flexShrink', 'flexBasis'];
    const values = attributes.map(n => this.attributeMatcher.getComputedValue(n, this.rowSettings && this.rowSettings[index] ? this.rowSettings[index].settings : []));
    const values2 = values.map(v => v !== undefined && v !== null && v !== '' && v.trim() !== '' ? `${v.trim()}` : '');
    return values2.join(' ');
  }

  gridItemInnerStyles(row: number, column: number): any {
    const index = this.itemIndex(row, column);
    const settings = this.columnSettings && this.columnSettings[index] ? this.columnSettings[index].settings : [];
    return { height: this.calculateHeight(this.attributeMatcher.getComputedValue('height', settings)) };
  }

  calculateHeight(v?: string): string {
    const trimmed = v !== undefined && v !== null ? v.trim() : 'auto';
    return trimmed;
  }

}
