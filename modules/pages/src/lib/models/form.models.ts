import { AttributeValue } from 'attributes';

export class PropertiesFormPayload {
  title: string;
  name: string;
  path: string;
  readUserIds: Array<string> = [];
  cssFile: string;
  constructor(data?: PropertiesFormPayload) {
    if(data) {
      this.title = data.title;
      this.name = data.name;
      this.path = data.path;
      this.cssFile = data.cssFile;
      if (data.readUserIds) {
        this.readUserIds = data.readUserIds.map(id => id);
      }
    }
  }
}

export class PanelPropsFormPayload {
  label: string;
  name: string;
  constructor(data?: PanelPropsFormPayload) {
    if(data) {
      this.label = data.label;
      this.name = data.name;
    }
  }
}


export class PanePropsFormPayload {
  label: string;
  name: string;
  constructor(data?: PanePropsFormPayload) {
    if(data) {
      this.label = data.label;
      this.name = data.name;
    }
  }
}

export class PanelPageForm {
  id: string;
  name: string;
  title: string;
  derivativeId: string;
  panels: Array<PanelPageFormPanel> = [];
  constructor(data?: PanelPageForm) {
    if(data) {
      this.id = data.id;
      this.name = data.name;
      this.title = data.title;
      this.derivativeId = data.derivativeId;
      if(data.panels) {
        this.panels = data.panels.map(p => new PanelPageFormPanel(p));
      }
    }
  }
}

export class PanelPageFormPanel {
  name: string;
  label: string;
  panes: Array<PanelPageFormPane> = [];
  constructor(data?: PanelPageFormPanel) {
    if(data) {
      this.name = data.name;
      this.label = data.label;
      if(data.panes) {
        this.panes = data.panes.map(p => new PanelPageFormPane(p));
      }
    }
  }
}

export class PanelPageFormPane {
  name: string;
  label: string;
  contentPlugin: string;
  settings: Array<AttributeValue> = [];
  constructor(data?: PanelPageFormPane) {
    if(data) {
      this.name = data.name;
      this.label = data.label;
      this.contentPlugin = data.contentPlugin;
      if(data.settings) {
        this.settings = data.settings.map(s => new AttributeValue(s));
      }
    }
  }
}
