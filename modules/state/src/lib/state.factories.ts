import { EntityServices } from "@ngrx/data";
import { State } from "@ngrx/store";
import { AttributeSerializerService, AttributeValue } from '@ng-druid/attributes';
import { BridgeBuilderPlugin, PublicApiBridgeService } from '@ng-druid/bridge';
import { ContextPlugin } from '@ng-druid/context';
import { of } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { ContextStateEditorComponent } from "./components/context-state-editor/context-state-editor.component";
import { StateContextResolver } from "./contexts/state-context.resolver";
import { GlobalState } from "./models/state.models";

export const stateContextFactory = (resolver: StateContextResolver) => {
  const baseObject = new AttributeValue();
  return new ContextPlugin<string>({ id: 'state', name: 'state', title: 'State', baseObject, resolver, editorComponent: ContextStateEditorComponent });
};

export const stateBridgeFactory = (es: EntityServices, attributeSerializer: AttributeSerializerService) => {
  return new BridgeBuilderPlugin<string>({
    id: 'state',
    title: 'State',
    build: () => {
      PublicApiBridgeService.prototype['writeState'] = (gs: GlobalState): Promise<GlobalState> => {
        return new Promise(res => {
          const svc = es.getEntityCollectionService('GlobalState');
          /*svc.getByKey(f.id).pipe(
            // catchError(() => of(new GlobalState({ id: f.id, value: attributeSerializer.serialize(f.state, 'root') }))),
            switchMap(state => svc.upsert(new GlobalState({ id: f.id, value: attributeSerializer.serialize(f.state, 'root') })))
          ).subscribe(state => {
            res(state);
          });*/
          svc.upsert(new GlobalState({ id: gs.id, value: attributeSerializer.serialize(gs.value, 'root') })).pipe(
            tap(state => res(state))
          ).subscribe();
        });
      }
    }
  }); 
};