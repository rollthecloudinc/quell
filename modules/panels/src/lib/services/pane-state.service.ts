import { Injectable } from "@angular/core";
import { EntityCollection, EntityCollectionService, EntityServices } from "@ngrx/data";
import { createSelector, select } from "@ngrx/store";
import { AttributeSerializerService, AttributeValue } from "attributes";
import { ContentPlugin } from "content";
import merge from "deepmerge-json";
import { JSONPath } from "jsonpath-plus";
import { Observable, of } from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";
import { PageBuilderFacade } from "../features/page-builder/page-builder.facade";
import { PanelStateArchitectService } from './panel-state-architect.service';
import { PanelPageState, PaneState } from '../models/state.models';

@Injectable({
  providedIn: 'root'
})
export class PaneStateService {

  private panelPageStateService: EntityCollectionService<PanelPageState>;

  private selectEntities = (entities: EntityCollection<PanelPageState>) => entities.entities;
  private selectById = ({ id }: { id: string }) => createSelector(
    this.selectEntities,
    entities => entities[id] ? entities[id] : undefined
  );

  constructor(
    private pageBuilderFacade: PageBuilderFacade,
    private panelStateArchitectService: PanelStateArchitectService,
    private attributeSerializer: AttributeSerializerService,
    es: EntityServices
  ) {
    this.panelPageStateService = es.getEntityCollectionService('PanelPageState');
  }

  mergeState(
    { state, settings, plugin, ancestory }: { state: any, settings: Array<AttributeValue>, plugin: ContentPlugin<string>, ancestory: Array<number> }
  ): Observable<{ paneState: PaneState, pageState: PanelPageState }> {

    return of(state).pipe(
      switchMap(s => this.pageBuilderFacade.getPageInfo$.pipe(
        map(p => [s, p])
      )),
      switchMap(([s, p]) => plugin.handler.stateDefinition(settings).pipe(
        map(d => [s, p, d])
      )),
      switchMap(([s, p, d]) => this.panelPageStateService.collection$.pipe(
        select(this.selectById({ id: p.id })),
        map(ps => [s, new PanelPageState(ps ? ps : { id: p.id, panels: [] }), d]),
        take(1)
      )),
      map(([s, ps, d]) => {
        this.panelStateArchitectService.buildToAncestorySpec({ panelPageState: ps, ancestory: [ ...ancestory ] });
        const path = '$.' + ancestory.map((index, i) => `${(i + 1) % 2 === 0 ? 'panes' : (i === 0 ? '' : 'nestedPage.') + 'panels'}[${index}]`).join('.');
        const paneState = JSONPath({ path, json: ps })[0];
        return [s, ps, d, paneState];
      }),
      tap(([s, _, d, ps2]) => {
        const deserializedState = ps2.state ? ps2.state.root ? this.attributeSerializer.deserialize(ps2.state).root : this.attributeSerializer.deserialize(ps2.state) : {}; 
        const newState = merge(!deserializedState || Object.keys(deserializedState).length === 0 ? d : deserializedState, s);
        ps2.state = this.attributeSerializer.serialize(newState, 'root');
      }),
      map(([_, ps, __, ps2]) => ({ paneState: ps2, pageState: ps }))
    );

  }

}