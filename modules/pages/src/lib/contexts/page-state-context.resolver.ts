import { Injectable } from '@angular/core';
import { EntityServices } from '@ngrx/data';
import { ContextResolver, ContextPlugin } from 'context';
import { PanelPage, PanelPageState, PanelState, PanelStateConverterService, PaneState } from 'panels';
import { iif, Observable, of } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { PageBuilderFacade } from '../features/page-builder/page-builder.facade';
import { JSONPath } from 'jsonpath-plus';
import { AttributeSerializerService } from 'attributes';

@Injectable()
export class PageStateContextResolver implements ContextResolver {

  constructor(
    private entityServices: EntityServices,
    private pageBuilderFacade: PageBuilderFacade,
    private panelStateConverterService: PanelStateConverterService,
    private attributeSerializer: AttributeSerializerService
  ) { }

  resolve(ctx: ContextPlugin, data?: any): Observable<any> {
    // const svc = this.entityServices.getEntityCollectionService('PanelPageState');
    // return svc.getByKey(data.id);
    return this.pageBuilderFacade.getPage$.pipe(
      withLatestFrom(this.pageBuilderFacade.getSelectionPath$.pipe(
        tap(selectionPath => selectionPath.join(',')),
        map(s => s.map((index, i) => `${(i + 1) % 2 === 0 ? 'panes' : (i === 0 ? '' : 'nestedPage.') + 'panels'}[${index}]`)),
        map(s => s.length === 0 ? undefined : '$.' + s.join('.'))
      )),
      tap(([pp, query]) => {
        console.log('page state context resolver');
        console.log(pp);
        console.log('query: ' + query);
      }),
      switchMap(([pp, query]) => iif<[PanelPageState, string], [PanelPageState, string]>(
        () => !!pp,
        this.panelStateConverterService.convertPageToState(pp).pipe(
          map(state => new PanelPageState({ ...state, panels: state.panels.map(p => new PanelState({ ...p, panes: p.panes.map(p2 => new PaneState({ ...p2, state: this.attributeSerializer.serialize({ displayAssociatedPane: false }, 'root') })) }))  })),
          map<PanelPageState, [PanelPageState, string]>(state => [state, query])
        ),
        of([new PanelPageState(), query])
      )),
      tap(([state, _]) => {
        console.log('rebuilt state from realtime page');
        console.log(state);
      }),
      map(([json, path]) => path ? JSONPath({ path, json })[0] : {}),
      tap(m => {
        console.log('json path match');
        console.log(m);
      }),
      /*map(m => new PaneState({ ...m[0], state: this.attributeSerializer.serialize({ displayAppJs: false }, 'root') })),
      tap(s => {
        console.log('final state');
        console.log(s);
      })*/
    );
  }
}
