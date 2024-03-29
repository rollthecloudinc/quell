import { AttributeValue } from '@rollthecloudinc/attributes';

export class PanelPageState { 
  id: string;
  panels: Array<PanelState> = [];
  constructor(data?: PanelPageState) {
    if (data) {
      this.id = data.id;
      if (data.panels !== undefined && Array.isArray(data.panels)) {
        this.panels = data.panels.map(p => new PanelState(p));
      }
    }
  }
}

export class PanelState {
  panes: Array<PaneState> = [];
  constructor(data?: PanelState) {
    if (data) {
      if (data.panes !== undefined && Array.isArray(data.panes)) {
        this.panes = data.panes.map(p => new PaneState(p));
      }
    }
  }
}

export class PaneState {
  state: AttributeValue;
  nestedPage?: PanelPageState;
  constructor(data?: PaneState) {
    if (data) {
      if (data.state !== undefined) {
        this.state = new AttributeValue(data.state);
      }
      if (data.nestedPage !== undefined && data.nestedPage !== null) {
        this.nestedPage = new PanelPageState(data.nestedPage);
      }
    }
  }
}