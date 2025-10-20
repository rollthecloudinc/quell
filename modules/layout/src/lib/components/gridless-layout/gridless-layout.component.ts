import { Component, OnInit, ContentChild, TemplateRef, Input } from '@angular/core';

@Component({
    selector: 'classifieds-ui-gridless-layout',
    templateUrl: './gridless-layout.component.html',
    styleUrls: ['./gridless-layout.component.scss'],
    host: {
        "[class.is-nested]": "nested"
    },
    standalone: false
})
export class GridlessLayoutComponent implements OnInit {

  @Input()
  displayMainControls = true;

  @Input()
  displayItemHeader = true;

  @Input()
  nested = false;

  @ContentChild('gridItemActions') gridItemActionsTmpl: TemplateRef<any>;
  @ContentChild('innerGridItem') innerGridItemTmpl: TemplateRef<any>;
  @ContentChild('extraActions') extraActionsTmpl: TemplateRef<any>;

  constructor() { }

  ngOnInit(): void {
  }

}
