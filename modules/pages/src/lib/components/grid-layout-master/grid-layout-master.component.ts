import { Component, OnInit, ContentChild, TemplateRef } from '@angular/core';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import { GridLayout } from '../../models/page.models';
import { Observable } from 'rxjs';
import { DisplayGrid, GridsterConfig, GridType } from 'angular-gridster2';

@Component({
  selector: 'classifieds-ui-grid-layout-master',
  templateUrl: './grid-layout-master.component.html',
  styleUrls: ['./grid-layout-master.component.scss']
})
export class GridLayoutMasterComponent implements OnInit {

  gridLayouts$: Observable<Array<GridLayout>>;

  options: GridsterConfig = {
    gridType: GridType.Fit,
    displayGrid: DisplayGrid.None,
    pushItems: false,
    mobileBreakpoint: 0,
    draggable: {
      enabled: false
    },
    resizable: {
      enabled: false
    }
  };

  private layoutService: EntityCollectionService<GridLayout>;

  @ContentChild('bottom') bottomTmpl: TemplateRef<any>;

  constructor(es: EntityServices) {
    this.layoutService = es.getEntityCollectionService('GridLayout');
  }

  ngOnInit(): void {
    this.gridLayouts$ = this.layoutService.getWithQuery({ site: 'main' });
  }

}
