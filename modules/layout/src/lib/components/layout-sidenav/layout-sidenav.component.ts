import { Component, Inject, Output, EventEmitter } from "@angular/core";
import { EntityCollectionService, EntityServices } from "@ngrx/data";
import { PanelPageListItem } from '@rollthecloudinc/panels';
import { SITE_NAME } from '@rollthecloudinc/utils';
import { AuthFacade } from '@rollthecloudinc/auth';
import { map, Observable } from "rxjs";
import { ControlContainer } from "@angular/forms";

@Component({
  selector: 'druid-layout-sidenav',
  templateUrl: './layout-sidenav.component.html',
  styleUrls: ['./layout-sidenav.component.scss'],
})
export class LayoutSidenavComponent {

  panelPageListItemsService: EntityCollectionService<PanelPageListItem>;

  panelPageListItems$: Observable<Array<PanelPageListItem>>;
  isAuthenticated$: Observable<boolean>;

  @Output() close = new EventEmitter<undefined>();

  constructor(
    @Inject(SITE_NAME) private siteName: string,
    private authFacade: AuthFacade, 
    public controlContainer: ControlContainer,
    es: EntityServices
  ) { 
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