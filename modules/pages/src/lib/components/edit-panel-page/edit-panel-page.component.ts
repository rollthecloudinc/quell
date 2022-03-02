import { Component, OnInit } from '@angular/core';
import { PanelPage, PanelPageListItem } from 'panels';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import { ActivatedRoute } from '@angular/router';
import { map, filter, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'classifieds-ui-edit-panel-page',
  templateUrl: './edit-panel-page.component.html',
  styleUrls: ['./edit-panel-page.component.scss']
})
export class EditPanelPageComponent implements OnInit {

  panelPage: PanelPage;

  private panelPageService: EntityCollectionService<PanelPage>;
  private panelPageListItemService: EntityCollectionService<PanelPageListItem>;

  constructor(private route: ActivatedRoute, es: EntityServices) {
    this.panelPageService = es.getEntityCollectionService('PanelPage');
    this.panelPageListItemService = es.getEntityCollectionService('PanelPageListItem');
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(p => p.get('panelPageId')),
      filter(id => id !== undefined),
      distinctUntilChanged(),
      switchMap(id => this.panelPageService.getByKey(id))
    ).subscribe(panelPage => {
      console.log(panelPage);
      this.panelPage = panelPage;
    });
  }

  onSubmit(panelPage: PanelPage) {
    console.log('submitted');
    // console.log(panelPage);
    this.panelPageService.update(new PanelPage({ ...panelPage, id: this.panelPage.id })).subscribe(() => {
      alert('panel page updated');
      const panelPageListItem = new PanelPageListItem({ ...panelPage, id: this.panelPage.id });
      this.panelPageListItemService.update(panelPageListItem).subscribe(() => {
        console.log('panel page list item created');
      });
    });
  }

}
