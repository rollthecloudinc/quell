import { Component, OnInit } from '@angular/core';
import { PanelPage } from '../../models/page.models';
import { EntityServices, EntityCollectionService } from '@ngrx/data';

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
    console.log(panelPage);
    this.panelPageService.add(panelPage).subscribe(() => {
      alert('panel page created');
    });
  }

}
