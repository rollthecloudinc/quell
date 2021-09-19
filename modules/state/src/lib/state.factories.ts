import { EntityServices } from "@ngrx/data";
import { AttributeSerializerService, AttributeValue } from "attributes";
import { BridgeBuilderPlugin, PublicApiBridgeService } from "bridge";
import { ContextPlugin } from "context";
import { ContextStateEditorComponent } from "./components/context-state-editor/context-state-editor.component";
import { StateContextResolver } from "./contexts/state-context.resolver";

export const stateContextFactory = (resolver: StateContextResolver) => {
  const baseObject = new AttributeValue();
  return new ContextPlugin<string>({ id: 'state', name: 'state', title: 'State', baseObject, resolver, editorComponent: ContextStateEditorComponent });
};

/*export const stateBridgeFactory = (es: EntityServices, attributeSerializer: AttributeSerializerService) => {
  return new BridgeBuilderPlugin<string>({
    id: 'state',
    title: 'State',
    build: () => {
      PublicApiBridgeService.prototype['writeState'] = (f: { id: string, panelIndex: number, paneIndex: number }, v: any): Promise<PanelPageState> => {
        return new Promise(res => {
          const svc = es.getEntityCollectionService('PanelPageState');
          svc.getByKey(f.id).pipe(
            catchError(() => of(new PanelPageState({ id: f.id, panels: [] }))),
            map(p => p === undefined ? new PanelPageState({ id: f.id, panels: [] }) : p),
            map(p => {
              const state = attributeSerializer.serialize(v, 'root');
              let panelPageState = new PanelPageState({ ...p, panels: [] });
              for(let i = 0; i < (f.panelIndex + 1); i++) {
                panelPageState.panels.push( i < p.panels.length ? new PanelState({ ...p.panels[i], panes: [] }) : new PanelState() );
                for(let j = 0; j < (f.paneIndex + 1); j++) {
                  if (i === f.panelIndex && j === f.paneIndex) {
                    panelPageState.panels[i].panes.push( i < p.panels.length && j < p.panels[i].panes.length ? new PaneState({ ...p.panels[i].panes[j], state }) : new PaneState({ state }));
                  } else {
                    panelPageState.panels[i].panes.push( i < p.panels.length && j < p.panels[i].panes.length ? new PaneState({ ...p.panels[i].panes[j] }) : new PaneState() );
                  }
                }
              }
              return panelPageState;
            }),
            switchMap(pps => svc.upsert(pps))
          ).subscribe(pps => {
            res(pps);
          });
        });
      }
    }
  }); 
};*/