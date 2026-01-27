import { InjectionToken } from '@angular/core';
import { RenderPaneComponent, PanelPageRouterComponent } from './components/panel-page/panel-page.component';

export const RENDER_PANE_TOKEN = new InjectionToken<RenderPaneComponent>('RenderPaneToken');
export const PANEL_PAGE_ROUTER_TOKEN = new InjectionToken<PanelPageRouterComponent>('PanelPageRouterToken');