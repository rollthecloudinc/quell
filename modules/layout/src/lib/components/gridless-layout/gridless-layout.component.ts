import { Component, OnInit, ContentChild, TemplateRef, Input } from '@angular/core';

@Component({
  selector: 'classifieds-ui-gridless-layout',
  templateUrl: './gridless-layout.component.html',
  styleUrls: ['./gridless-layout.component.scss']
})
export class GridlessLayoutComponent implements OnInit {

  @Input()
  displayMainControls = true;

  @Input()
  displayItemHeader = true;

  @ContentChild('gridItemActions') gridItemActionsTmpl: TemplateRef<any>;
  @ContentChild('innerGridItem') innerGridItemTmpl: TemplateRef<any>;
  @ContentChild('extraActions') extraActionsTmpl: TemplateRef<any>;

  constructor() { }

  ngOnInit(): void {
  }

}
