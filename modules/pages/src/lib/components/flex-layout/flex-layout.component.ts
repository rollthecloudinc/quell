import { Component, OnInit, Input, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'classifieds-ui-flex-layout',
  templateUrl: './flex-layout.component.html',
  styleUrls: ['./flex-layout.component.scss']
})
export class FlexLayoutComponent implements OnInit {

  @Input()
  dashboard = []

  @ContentChild('innerGridItem') innerGridItemTmpl: TemplateRef<any>;

  get totalRows(): number {
    return this.dashboard.length == 0 ? 0 : this.dashboard.reduce<number>((p, c) => c.y > p ? c.y : p, 0) + 1;
  }

  constructor() { }

  ngOnInit(): void {
  }

  itemIndex(rIndex: number, cIndex: number): any {
    return this.dashboard.findIndex(c => c.y === rIndex && c.x === cIndex);
  }

  totalColumns(rowIndex: number): number {
    return this.dashboard.reduce<number>((p, c) => c.y === rowIndex ? p + 1 : p, 0);
  }

}
