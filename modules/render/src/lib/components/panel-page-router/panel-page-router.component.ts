import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional, SkipSelf, forwardRef } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { getRouterSelectors, RouterReducerState } from '@ngrx/router-store';
import { EntityServices, EntityCollectionService, EntityDefinitionService } from '@ngrx/data';
import { iif, Observable, of } from 'rxjs';
import { map, filter, distinctUntilChanged, switchMap, withLatestFrom, tap, take, defaultIfEmpty } from 'rxjs/operators';
import { AsyncApiCallHelperService } from '@rollthecloudinc/utils';
import { CrudDataHelperService, CrudEntityMetadata } from '@rollthecloudinc/crud';
import { PanelPage, PageBuilderFacade, PanelPageStateSlice } from '@rollthecloudinc/panels';
import { PANEL_PAGE_ROUTER_TOKEN } from '../../render.tokens';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'classifieds-ui-panel-page-router',
    templateUrl: './panel-page-router.component.html',
    styleUrls: ['./panel-page-router.component.scss'],
    standalone: false,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PanelPageRouterComponent),
            multi: true
        },
      { provide: PANEL_PAGE_ROUTER_TOKEN, useExisting: forwardRef(() => PanelPageRouterComponent) }
    ]
})
export class PanelPageRouterComponent implements OnInit, ControlValueAccessor {

  // control = new FormControl('');

  readonly yield = !!this.panelPageRouterComponent
  routePanelPageId: string;
  panelPageId: string;

  public onTouched: () => void = () => {};

  private panelPageService: EntityCollectionService<PanelPage>;

  readonly paramMapSub = this.route.paramMap.pipe(
    tap(() => console.log('param map panelPageId')),
    map(p => p.get('panelPageId')),
    filter(id => id !== undefined),
    switchMap(() => this.route.data),
    // this.yield equals false act as decorator when equals true act as normal.
    // When false set routePanelPageId if it exists
    withLatestFrom(this.routerStore.pipe(
      select(getRouterSelectors((state: any) => state.router).selectCurrentRoute),
      map(route => route.params),
      take(1)
    )),
    tap(([data, args]) => console.log('panel page router param map', data.panelPageListItem.id, args)),
    map(([data, args]) => [data.panelPageListItem.id, args, data.path]),
    tap(([panelPageId, args, path]) => console.log('panel page router param map 2', panelPageId, args, path)),
    switchMap(([panelPageId, args, path]) =>
      this.yield ?
      of([panelPageId, args, undefined]) :
      this.crudDataHelperService
        .evaluateCollectionPlugins<PanelPage>({
          query: undefined,
          plugins: (this.entityDefinitionService.getDefinition('PanelPage').metadata as CrudEntityMetadata<any, {}>).crud,
          op: 'query'
        }).pipe(
          map(objects => objects.filter(o => o.path === '*')),
          map(objects => objects && objects.length ? objects[0].id : undefined),
          map(decoratorId => [panelPageId, args, path, decoratorId]),
          defaultIfEmpty([panelPageId, args, path, undefined])
        )
    ),
    tap(([ panelPageId, args, path, decoratorId ]) => {
      console.log('route page');
      const realPath = '/pages/panelpage/' + panelPageId;
      this.pageBuilderFacade.setPageInfo(new PanelPageStateSlice({ id: panelPageId, realPath, path, args }));
      this.panelPageId = panelPageId;
      // this.routePanelPageId = decoratorId
      if (decoratorId !== undefined && decoratorId !== this.routePanelPageId) {
        this.routePanelPageId = decoratorId;
      }
      console.log('router panelPageId', this.panelPageId);
      console.log('router routePanelPageId', this.routePanelPageId);
    })
  ).subscribe()

  constructor(
    @Optional() @SkipSelf() @Inject(PANEL_PAGE_ROUTER_TOKEN) private panelPageRouterComponent: PanelPageRouterComponent,
    private route: ActivatedRoute,
    private pageBuilderFacade: PageBuilderFacade,
    private routerStore: Store<RouterReducerState>,
    private asyncApiCallHelperSvc: AsyncApiCallHelperService,
    private crudDataHelperService: CrudDataHelperService,
    protected entityDefinitionService: EntityDefinitionService,
    es: EntityServices,
  ) {
    this.panelPageService = es.getEntityCollectionService('PanelPage');
  }

  writeValue(val: any): void {
  }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  ngOnInit(): void {
    /*
     * When not yileding content update the state for both the target page and route page.
    * Do this at the very same time so that the context is available throughout for rules and such.
     */
    if (!this.yield) {
      const { selectCurrentRoute } = getRouterSelectors((state: any) => state.router);
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

}
