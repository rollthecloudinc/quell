import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { EMBEDDABLE_COMPONENT, UtilsModule } from '@rollthecloudinc/utils';
import { InteractionHandlerPluginManager } from '@rollthecloudinc/detour';
import { PaneContentHostDirective } from './directives/pane-content-host.directive';
// import { RenderPanelComponent } from './components/render-panel/render-panel.component';
// import { RenderPaneComponent } from './components/render-pane/render-pane.component';
import { LayoutRendererHostDirective } from './directives/layout-renderer-host.directive';
import { PanelPageComponent, RenderPaneComponent, RenderPanelComponent } from './components/panel-page/panel-page.component';
import { LayoutModule } from '@rollthecloudinc/layout';
import { FormService, PageBuilderFacade, PanelsModule } from '@rollthecloudinc/panels';
import { EmptyLayoutComponent } from './components/empty-layout/empty-layout.component';
import { interationHandlerDialog, interationHandlerFormSubmit } from './render.factories';
import { PersistService, RefineryModule } from '@rollthecloudinc/refinery';
import { RenderDialogComponent } from './components/render-dialog/render-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '@rollthecloudinc/material';
// import { PanelpageModule } from 'panelpage';

@NgModule({
  declarations: [PaneContentHostDirective, EmptyLayoutComponent, RenderPanelComponent, RenderPaneComponent, LayoutRendererHostDirective, PanelPageComponent, RenderDialogComponent ],
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
    EmptyLayoutComponent
  ]
})
export class RenderModule { 
  constructor(
    ihpm: InteractionHandlerPluginManager,
    pageBuilderFacade: PageBuilderFacade,
    formService: FormService,
    persistService: PersistService,
    dialog: MatDialog
  ) {
    ihpm.register(interationHandlerFormSubmit({ pageBuilderFacade, formService, persistService }));
    ihpm.register(interationHandlerDialog({ dialog }));
  }
}
