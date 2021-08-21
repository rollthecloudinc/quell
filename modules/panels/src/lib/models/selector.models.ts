export class PanelPageSelector {
  panelPage: number;
  panel?: number;
  pane?: number;
  nested?: PanelPageSelector;
  constructor(data?: PanelPageSelector) {
    if (data) {
      this.panelPage = data.panelPage;
      if (data.panel !== undefined && data.panel !== null) {
        this.panel = data.panel;
      }
      if (data.pane !== undefined && data.pane !== null) {
        this.pane = data.pane;
      }
      if (data.nested !== undefined && data.nested !== null && typeof(data.nested) === 'object') {
        this.nested = new PanelPageSelector(data.nested);
      }
    }
  }
}