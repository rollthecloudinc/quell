import { PanelContentHandler } from './handlers/panel-content.handler';
import { PanelSelectorComponent } from './plugins/panel/panel-selector/panel-selector.component';
import { PanelEditorComponent } from './plugins/panel/panel-editor/panel-editor.component';
import { ContentPlugin } from 'content';
import { BridgeBuilderPlugin, PublicApiBridgeService } from 'bridge';
import { EntityServices } from '@ngrx/data';
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { PanelPageState, PanelState, PaneState } from './models/state.models';
import { of } from 'rxjs';

export const panelContentPluginFactory = (handler: PanelContentHandler) => {
  return new ContentPlugin<string>({
    id: 'panel',
    title: 'Panel',
    selectionComponent: PanelSelectorComponent,
    editorComponent: PanelEditorComponent,
    renderComponent: undefined,
    handler
  })
}

export const panelsBridgeFactory = (es: EntityServices, attributeSerializer: AttributeSerializerService) => {
  return new BridgeBuilderPlugin<string>({
    id: 'panels',
    title: 'Panels',
    build: () => {
      PublicApiBridgeService.prototype['writePaneState'] = (f: { id: string, panelIndex: number, paneIndex: number }, v: any): Promise<PanelPageState> => {
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
};

