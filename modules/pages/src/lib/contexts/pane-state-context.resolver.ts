import { Injectable } from '@angular/core';
import { EntityCollection, EntityCollectionService, EntityServices } from '@ngrx/data';
import { ContextResolver, ContextPlugin } from 'context';
import { PanelPage, PanelPageSelector, PanelPageState, PanelState, PanelStateConverterService, PaneState, PageBuilderFacade, PanelPageStateSlice  } from 'panels';
import { combineLatest, iif, Observable, of } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { JSONPath } from 'jsonpath-plus';
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { createSelector, select } from '@ngrx/store';

@Injectable()
export class PaneStateContextResolver implements ContextResolver {

  /*resolverCache$ = new Map<string, Observable<any>>();

  get entities$(): Observable<Array<PanelPageState>> {
    return this.entityServices.getEntityCollectionService('PanelPageState').entities$.pipe(
      tap(e => {
        console.log('entities in store');
        console.log(e);
      })
    );
  }

  get panelPage$(): Observable<PanelPage> {
    return combineLatest([this.pageBuilderFacade.getPageInfo$, this.entityServices.getEntityCollectionService('PanelPage').entities$]).pipe(
      // map(([p, entities]) => [this.fakePageInfo , entities]),
      map<[PanelPageStateSlice, Array<PanelPage>], PanelPage>(([p, entities]) => p && p.id !== undefined && p.id !== '' && p.id !== null ? entities.findIndex(e => e.id === p.id) !== -1 ? entities.find(e => e.id === p.id) : undefined : undefined)
    );
  }

  get fakePageInfo(): PanelPageStateSlice {
    return new PanelPageStateSlice({ id: '948d6e7b-12ab-11ec-8ecd-661fdd19e6df', path: '', realPath: '', args: new Map<string, string>()});
  }*/

  get entityCollectionService(): EntityCollectionService<PanelPageState> {
    return this.entityServices.getEntityCollectionService('PanelPageState');
  }

  constructor(
    private entityServices: EntityServices,
    // private pageBuilderFacade: PageBuilderFacade,
    // private panelStateConverterService: PanelStateConverterService,
    private attributeSerializer: AttributeSerializerService
  ) { }

  resolve(ctx: ContextPlugin, data?: any): Observable<any> {

    const selectEntities = (entities: EntityCollection<PanelPageState>) => entities.entities;
    const selectById = ({ id }: { id: string }) => createSelector(
      selectEntities,
      entities => entities[id] ? entities[id] : undefined
    );
    const selectByPath = ({ id, path }: { id: string, path: string }) => createSelector(
      selectById({ id }),
      json => JSONPath({ path, json })
    );

    const path = '$.' + data.selectionPath.map((index, i) => `${(i + 1) % 2 === 0 ? 'panes' : (i === 0 ? '' : 'nestedPage.') + 'panels'}[${index}]`).join('.');
    return this.entityCollectionService.collection$.pipe(
      select(selectByPath({ id: data.id, path })),
      map(m => m && Array.isArray(m) && m.length !== 0 ? m[0] : this.defaultPaneState(data.value ? data.value : {})),
      map(ps => this.attributeSerializer.deserialize(ps.state)),
      map(value => value ? value.root ? value.root : value : {}),
      tap(v => {
        console.log(`resolved panestate[id=${data.id}]${path}`);
        console.log(v);
      })
    );

    /*(const cacheKey = data && data.selectionPath && data.selectionPath.length !== 0 && data.id && data.id !== null && data.id !== '' ? `ps[id=${data.id}]${data.selectionPath.map(i => `${i}`).join('')}`  : undefined;
    if (cacheKey && this.resolverCache$.has(cacheKey)) {
      return this.resolverCache$.get(cacheKey);
    } else {
      const resolver = this.resolve$(ctx, data);
      if (cacheKey) {
        this.resolverCache$.set(cacheKey, resolver);
      }
      return resolver;
    }*/
    
  }

  /*resolve$(ctx: ContextPlugin, data?: any): Observable<any> {
    return combineLatest([this.panelPage$, this.entities$]).pipe(
      map<[PanelPage, Array<PanelPageState>], [PanelPage, PanelPageState]>(([pp, entities]) => [pp, pp && entities.findIndex(e => e.id === pp.id) !== -1 ? entities.find(e => e.id === pp.id) : new PanelPageState()]),
      switchMap(([pp, ps]) => this.pageBuilderFacade.getSelectionPath$.pipe(
        map(selectionPath => data && data.selectionPath ? data.selectionPath : selectionPath), // temp hard code to see if context change is triggered
        tap(selectionPath => selectionPath.join(',')),
        map(s => s.map((index, i) => `${(i + 1) % 2 === 0 ? 'panes' : (i === 0 ? '' : 'nestedPage.') + 'panels'}[${index}]`)),
        map(s => s.length === 0 ? undefined : '$.' + s.join('.')),
        map<string, [PanelPage, PanelPageState, string]>(s => [pp, ps, s])
      )),
      tap(([pp, ps, query]) => {
        console.log('page state context resolver');
        console.log(pp);
        console.log('query: ' + query);
      }),
      switchMap(([pp, ps, query]) => iif<[PanelPageState, string], [PanelPageState, string]>(
        () => !!pp && !ps,
        this.panelStateConverterService.convertPageToState(pp).pipe(
          map(state => new PanelPageState({ ...state, panels: state.panels.map(p => new PanelState({ ...p, panes: p.panes.map(p2 => new PaneState({ ...p2, state: this.attributeSerializer.serialize(data.value ? data.value : {}, 'root') })) }))  })),
          map<PanelPageState, [PanelPageState, string]>(state => [state, query])
        ),
        of([ps ? ps : this.defaultPaneState(data.value ? data.value : {}), query])
      )),
      tap(([state, _]) => {
        console.log('rebuilt state from realtime page');
        console.log(state);
      }),
      map(([json, path]) => path ? JSONPath({ path, json }) : this.defaultPaneState(data.value ? data.value : {})),
      map(m => m && Array.isArray(m) && m.length !== 0 ? m[0] : this.defaultPaneState(data.value ? data.value : {})),
      tap(m => {
        console.log('json path match');
        console.log(m);
      }),
      map(ps => this.attributeSerializer.deserializeAsObject(ps.state)),*/
      /*map(m => new PaneState({ ...m[0], state: this.attributeSerializer.serialize({ displayAppJs: false }, 'root') })),*/
      /*tap(s => {
        console.log('final state');
        console.log(s);
      }),
      map(s => s.root ? s.root : s.root === undefined && Object.keys(s).length === 1 ? {} : s)
    );
  }*/

  private defaultPaneState(v?: any): PaneState {
    return new PaneState({ state: this.attributeSerializer.serialize(v, 'root') });
  }

}
