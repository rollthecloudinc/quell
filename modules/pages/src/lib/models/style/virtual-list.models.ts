import { Pane } from "panels";

export class VirtualListItem {
  pane: Pane;
  resolvedContext: any;
  constructor(data?: VirtualListItem) {
    if (data) {
      this.pane = data.pane;
      this.resolvedContext = data.resolvedContext;
    }
  }
}