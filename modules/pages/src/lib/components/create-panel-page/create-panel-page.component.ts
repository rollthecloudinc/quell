import { Component, OnInit } from '@angular/core';
import { PanelPage } from 'panels';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import * as uuid from 'uuid';

@Component({
  selector: 'classifieds-ui-create-panel-page',
  templateUrl: './create-panel-page.component.html',
  styleUrls: ['./create-panel-page.component.scss']
})
export class CreatePanelPageComponent implements OnInit {

  private panelPageService: EntityCollectionService<PanelPage>;

  constructor(es: EntityServices) {
    this.panelPageService = es.getEntityCollectionService('PanelPage');
  }

  ngOnInit(): void {
    console.log('here');
  }

  onSubmit(panelPage: PanelPage) {
    console.log('create panel page', panelPage);
    panelPage.id = uuid.v4(); // For now just do this here.
    this.panelPageService.add(panelPage).subscribe(() => {
      alert('panel page created');
    });
  }

}
