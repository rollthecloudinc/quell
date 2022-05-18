import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { getSelectors, RouterReducerState } from '@ngrx/router-store';
import { EntityServices, EntityCollectionService, EntityDefinitionService } from '@ngrx/data';
import { PanelPage, PageBuilderFacade, PanelPageStateSlice } from '@ng-druid/panels';
import { map, filter, distinctUntilChanged, switchMap, withLatestFrom, tap, take, delay } from 'rxjs/operators';
import { AsyncApiCallHelperService } from '@ng-druid/utils';
import { CrudDataHelperService, CrudEntityMetadata } from '@ng-druid/crud';

@Component({
  selector: 'classifieds-ui-panel-page-router',
  templateUrl: './panel-page-router.component.html',
  styleUrls: ['./panel-page-router.component.scss']
})
export class PanelPageRouterComponent implements OnInit {

  panelPageId: string;

  private panelPageService: EntityCollectionService<PanelPage>;

  readonly paramMapSub = this.route.paramMap.pipe(
    tap(() => console.log('param map panelPageId')),
    map(p => p.get('panelPageId')),
    filter(id => id !== undefined),
    switchMap(() => this.route.data),
    withLatestFrom(this.routerStore.pipe(
      select(getSelectors((state: any) => state.router).selectCurrentRoute),
      map(route => route.params),
      take(1)
    )),
    tap(([ data, args ]) => {
      console.log('route page');
      const realPath = '/pages/panelpage/' + data.panelPageListItem.id;
      this.pageBuilderFacade.setPageInfo(new PanelPageStateSlice({ id: data.panelPageListItem.id, realPath, path: data.panelPageListItem.path, args }));
      this.panelPageId = data.panelPageListItem.id;
    })
  ).subscribe()

  constructor(
    private route: ActivatedRoute,
    private pageBuilderFacade: PageBuilderFacade,
    private routerStore: Store<RouterReducerState>,
    private asyncApiCallHelperSvc: AsyncApiCallHelperService,
    private crudDataHelperService: CrudDataHelperService,
    protected entityDefinitionService: EntityDefinitionService,
    es: EntityServices
  ) {
    this.panelPageService = es.getEntityCollectionService('PanelPage');
    route.data.pipe(take(1)).subscribe(d2 => this.panelPageId = d2.panelPageListItem.id);
  }

  ngOnInit(): void {
    const { selectCurrentRoute } = getSelectors((state: any) => state.router);
    this.route.paramMap.pipe(
      tap(() => console.log('param map page builder facade info')),
      withLatestFrom(this.pageBuilderFacade.getPageInfo$),
      filter(([p, pageInfo]) => pageInfo !== undefined && p.get('panelPageId') !== undefined && p.get('panelPageId') === pageInfo.id),
      switchMap(([p, pageInfo]) => this.routerStore.pipe(
        select(selectCurrentRoute),
        map(route => [pageInfo, route.params]),
        take(1)
      ))
    ).subscribe(([pageInfo, args]) => {
      //console.log('update page info');
      this.pageBuilderFacade.setPageInfo(new PanelPageStateSlice({ ...pageInfo, args }));
    });
  }

}
