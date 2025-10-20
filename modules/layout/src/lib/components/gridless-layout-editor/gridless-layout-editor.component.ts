import { Component, OnInit, Input, TemplateRef, Inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { EntityCollectionService, EntityServices } from '@ngrx/data';
import { LayoutEditorBaseComponent, PanelPageListItem } from '@rollthecloudinc/panels';
import { SITE_NAME } from '@rollthecloudinc/utils';
import { AuthFacade } from '@rollthecloudinc/auth';
import { map, Observable, Subject, tap } from 'rxjs';

@Component({
    selector: 'classifieds-ui-gridless-layout-editor',
    templateUrl: './gridless-layout-editor.component.html',
    styleUrls: ['./gridless-layout-editor.component.scss'],
    standalone: false
})
export class GridlessLayoutEditorComponent extends LayoutEditorBaseComponent implements OnInit {

  panelPageListItemsService: EntityCollectionService<PanelPageListItem>;

  panelPageListItems$: Observable<Array<PanelPageListItem>>;
  isAuthenticated$: Observable<boolean>;

  constructor(
    @Inject(SITE_NAME) private siteName: string,
    private authFacade: AuthFacade, 
    public controlContainer: ControlContainer,
    es: EntityServices
  ) { 
    super(controlContainer);
    this.panelPageListItemsService = es.getEntityCollectionService('PanelPageListItem');
  }

  ngOnInit(): void {
    this.panelPageListItems$ = this.panelPageListItemsService.getWithQuery(`site=${encodeURIComponent(`{"term":{"site.keyword":{"value":"${this.siteName}"}}}`)}`);
    this.isAuthenticated$ = this.authFacade.getUser$.pipe(
      map(u => !!u)
    );
  }

  login() {
    this.authFacade.login()
  }

}