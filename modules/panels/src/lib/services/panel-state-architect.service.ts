import { Injectable } from "@angular/core";
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { Observable, of } from "rxjs";
import { PanelPageState, PanelState, PaneState } from "../models/state.models";

@Injectable({
  providedIn: 'root'
})
export class PanelStateArchitectService {

  constructor(
    private attributeSerializer: AttributeSerializerService
  ) {

  }

  buildToAncestorySpec(
    { panelPageState, ancestory } : { panelPageState: PanelPageState, ancestory: Array<number> }
  ) {
    for (let i = 0; i < ancestory[0] + 1; i++) {
      if (panelPageState.panels.length < (i + 1)) {
        panelPageState.panels.push(new PanelState());
      }
      if (i === ancestory[0] && ancestory.length > 1) {
        for (let j = 0; j < ancestory[1] + 1; j++) {
          if (panelPageState.panels[ancestory[0]].panes.length < (j + 1)) {
            panelPageState.panels[ancestory[0]].panes.push(new PaneState({ state: this.attributeSerializer.serialize({}, 'root') }));
          }
          if (j === ancestory[1] && ancestory.length > 2) {
            if (!panelPageState.panels[ancestory[0]].panes[j].nestedPage) {
              panelPageState.panels[ancestory[0]].panes[j].nestedPage = new PanelPageState();
            }
            this.buildToAncestorySpec({ panelPageState: panelPageState.panels[ancestory[0]].panes[j].nestedPage, ancestory: ancestory.slice(2) });
          }
        }
      }
    }
  }

}