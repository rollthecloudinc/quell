import { Injectable } from "@angular/core";
import { PanelContentHandler } from "../handlers/panel-content.handler";
import { Pane, Panel, PanelPage } from "../models/panels.models";

@Injectable({
  providedIn: 'root'
})
export class PanelsSelectorService {
  constructor(
    private panelHandler: PanelContentHandler
  ) {
  }
  rebuildPage(panelPage: PanelPage, path: Array<number>): PanelPage {
    return new PanelPage({ ...panelPage, panels: this.rebuildPanels(panelPage.panels, [ ...path ]) });
  }

  rebuildPanels(panels: Array<Panel>, path: Array<number>): Array<Panel> {
    return panels.filter((_, i) => this.rebuildCondition(path[0], i)).map(p => new Panel({ ...p, panes: this.rebuildPanes(p.panes, path.slice(1)) }));
  }

  rebuildPanes(panes: Array<Pane>, path: Array<number>): Array<Pane> {
    return panes.filter((_, i) => this.rebuildCondition(path[0], i)).map(p => p.contentPlugin === 'panel' ? new Pane({ ...p, nestedPage: undefined, settings: this.panelHandler.buildSettings(this.rebuildPage(p.nestedPage, path.slice(1))) }) : new Pane({ ...p }));
  }

  rebuildCondition(s: number, i: number): boolean {
    return s !== 0 ? s > -1 ? i === (s + (s * -1)) : i !== ((s* -1) + s) : true;
  }
}