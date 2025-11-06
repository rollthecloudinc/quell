import { Injectable } from '@angular/core';
import { RenderPaneComponent, RenderPanelComponent, PanelPageComponent } from '../components/panel-page/panel-page.component'; // Adjust the path based on your setup

@Injectable({
  providedIn: 'root'
})
export class TransversePanelPageComponentService {
  
  /**
   * Recursively traverses the hierarchy of the panel page components.
   *
   * @param component - The starting component to transverse (can be PanelPageComponent, RenderPanelComponent, or RenderPaneComponent).
   * @param visitorFn - A visitor function that will be called for each component visited in the hierarchy.
   */
  traverseAndVisit(component: any, visitorFn: (visitedComponent: any) => void): void {
    if (!component) {
      return;
    }

    // Call the visitor function for the current component
    visitorFn(component);

    if (component instanceof PanelPageComponent) {
      // Traverse all rendered panels in the PanelPageComponent
      component.renderedPanels.forEach((renderPanelComponent: RenderPanelComponent) => {
        this.traverseAndVisit(renderPanelComponent, visitorFn);
      });
    } else if (component instanceof RenderPanelComponent) {
      // Traverse all rendered panes in the RenderPanelComponent
      component.renderedPanes.forEach((renderPaneComponent: RenderPaneComponent) => {
        this.traverseAndVisit(renderPaneComponent, visitorFn);
      });
    } else if (component instanceof RenderPaneComponent) {
      // Check for nested PanelPageComponent inside RenderPaneComponent
      if (component.panelPageComponent) {
        this.traverseAndVisit(component.panelPageComponent, visitorFn);
      }
    }
  }
}