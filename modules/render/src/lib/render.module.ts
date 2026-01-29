import { CommonModule } from '@angular/common';
import { NgModule, Injector } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { EMBEDDABLE_COMPONENT, UtilsModule } from '@rollthecloudinc/utils';
import { InteractionHandlerPluginManager } from '@rollthecloudinc/detour';
import { PaneContentHostDirective } from './directives/pane-content-host.directive';
// import { RenderPanelComponent } from './components/render-panel/render-panel.component';
// import { RenderPaneComponent } from './components/render-pane/render-pane.component';
import { LayoutRendererHostDirective } from './directives/layout-renderer-host.directive';
import { PanelPageComponent, RenderPaneComponent, RenderPanelComponent, PanelPageRouterComponent } from './components/panel-page/panel-page.component';
import { LayoutModule } from '@rollthecloudinc/layout';
import { FormService, PageBuilderFacade, PanelsModule } from '@rollthecloudinc/panels';
import { EmptyLayoutComponent } from './components/empty-layout/empty-layout.component';
import { interactionHandlerAnchoredDialog, interationHandlerDialog, interationHandlerFormSubmit } from './render.factories';
import { PersistService, RefineryModule } from '@rollthecloudinc/refinery';
import { RenderDialogComponent } from './components/render-dialog/render-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '@rollthecloudinc/material';
import { TransversePanelPageComponentService } from './services/transverse-panelpage-component.service';
import { RouteReuseStrategy } from '@angular/router';
import { YieldingRouteReuseStrategy } from './strategy/yielding-route-reuse-strategy';
import { Overlay } from '@angular/cdk/overlay';
import { PopoverOverlayComponent } from './components/popover-overlay/popover-overlay.component';
// import { PanelpageModule } from 'panelpage';

@NgModule({
  declarations: [PaneContentHostDirective, EmptyLayoutComponent, RenderPanelComponent, RenderPaneComponent, LayoutRendererHostDirective, PanelPageComponent, RenderDialogComponent, PanelPageRouterComponent, PopoverOverlayComponent ],
  imports: [
    CommonModule,
    // HttpClientModule,
    FormsModule,
    UtilsModule,
    ReactiveFormsModule,
    PanelsModule,
    LayoutModule,
    MaterialModule
    // PanelpageModule
  ],
  exports: [
    RenderPanelComponent,
    RenderPaneComponent,
    PanelPageComponent,
    EmptyLayoutComponent,
    PanelPageRouterComponent
  ],
  providers: [
    { provide: EMBEDDABLE_COMPONENT, useValue: PanelPageRouterComponent, multi: true},
    { provide: RouteReuseStrategy, useClass: YieldingRouteReuseStrategy},
  ]
})
export class RenderModule { 
  constructor(
    ihpm: InteractionHandlerPluginManager,
    pageBuilderFacade: PageBuilderFacade,
    formService: FormService,
    persistService: PersistService,
    dialog: MatDialog,
    transversePanelpageComponentSvc: TransversePanelPageComponentService,
    overlay: Overlay,
    injector: Injector
  ) {
    ihpm.register(interationHandlerFormSubmit({ pageBuilderFacade, formService, persistService, transversePanelpageComponentSvc }));
    ihpm.register(interationHandlerDialog({ dialog }));
    ihpm.register(interactionHandlerAnchoredDialog({ overlay, injector })
    );
  }
}
