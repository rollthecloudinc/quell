import { Component, OnInit } from '@angular/core';
import { PageBuilderFacade, PanelPage, PanelPageListItem, PanelPageStateSlice } from '@rollthecloudinc/panels';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import { ActivatedRoute } from '@angular/router';
import { map, filter, distinctUntilChanged, switchMap, tap, withLatestFrom, take, defaultIfEmpty, delay } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { getRouterSelectors, RouterReducerState } from '@ngrx/router-store';
import { forkJoin, of } from 'rxjs';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { ModuleLoaderService } from '@rollthecloudinc/utils';

@Component({
  selector: 'classifieds-ui-edit-panel-page',
  templateUrl: './edit-panel-page.component.html',
  styleUrls: ['./edit-panel-page.component.scss']
})
export class EditPanelPageComponent implements OnInit {

  panelPage: PanelPage;

  private panelPageService: EntityCollectionService<PanelPage>;
  private panelPageListItemService: EntityCollectionService<PanelPageListItem>;

  constructor(
    private route: ActivatedRoute, 
    private pageBuilderFacade: PageBuilderFacade,
    private routerStore: Store<RouterReducerState>,
    private moduleLoader: ModuleLoaderService,
    es: EntityServices
  ) {
    this.panelPageService = es.getEntityCollectionService('PanelPage');
    this.panelPageListItemService = es.getEntityCollectionService('PanelPageListItem');
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(p => p.get('panelPageId')),
      filter(id => id !== undefined),
      distinctUntilChanged(),
      switchMap(id => this.panelPageService.getByKey(id)),
      switchMap(pp => pp ? forkJoin(
          pp.contexts.filter(c => c.plugin === 'module').map(c => 
            this.moduleLoader.loadModule(
              () => loadRemoteModule({
                type: 'module',
                remoteEntry: c.data.remoteEntry,
                exposedModule: c.data.exposedModule
              }).then(m => m[c.data.moduleName])
            )
          )
        ).pipe(
          delay(1),
          map(() => pp),
          defaultIfEmpty(pp)
        ) 
        : of(pp)
      ),
      switchMap(pp => this.routerStore.pipe(
        select(getSelectors((state: any) => state.router).selectCurrentRoute),
        map(route => [pp, route.params ]),
        take(1)
      )),
      tap(([ pp, args ]) => this.pageBuilderFacade.setPageInfo(new PanelPageStateSlice({ id: pp.id, realPath: `/pages/panelpage/${pp.id}`, path: pp.path, args }))),
    ).subscribe(([ panelPage ]) => {
      console.log(panelPage);
      this.panelPage = panelPage;
    });
  }

  onSubmit(panelPage: PanelPage) {
    console.log('submitted');
    // console.log(panelPage);
    this.panelPageService.update(new PanelPage({ ...panelPage, id: this.panelPage.id })).subscribe(() => {
      alert('panel page updated');
    });
  }

}
