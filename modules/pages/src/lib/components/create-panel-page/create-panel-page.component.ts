import { Component, OnInit } from '@angular/core';
import { PanelPage, PanelPageListItem } from '@rollthecloudinc/panels';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import * as uuid from 'uuid';

@Component({
    selector: 'classifieds-ui-create-panel-page',
    templateUrl: './create-panel-page.component.html',
    styleUrls: ['./create-panel-page.component.scss'],
    standalone: false
})
export class CreatePanelPageComponent implements OnInit {

  private panelPageService: EntityCollectionService<PanelPage>;
  private panelPageListItemService: EntityCollectionService<PanelPageListItem>;

  constructor(es: EntityServices) {
    this.panelPageService = es.getEntityCollectionService('PanelPage');
    this.panelPageListItemService = es.getEntityCollectionService('PanelPageListItem');
  }

  ngOnInit(): void {
    console.log('here');
  }

  onSubmit(panelPage: PanelPage) {
    console.log('create panel page', panelPage);
    panelPage.id = uuid.v4(); // For now just do this here.
    this.panelPageService.add(panelPage).subscribe(() => {
      console.log('panel page created');
    });
  }

}
