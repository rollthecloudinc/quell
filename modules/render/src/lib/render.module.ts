import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { EMBEDDABLE_COMPONENT, UtilsModule } from '@ng-druid/utils';
import { PaneContentHostDirective } from './directives/pane-content-host.directive';
// import { RenderPanelComponent } from './components/render-panel/render-panel.component';
// import { RenderPaneComponent } from './components/render-pane/render-pane.component';
import { LayoutRendererHostDirective } from './directives/layout-renderer-host.directive';
import { PanelPageComponent, RenderPaneComponent, RenderPanelComponent } from './components/panel-page/panel-page.component';
import { LayoutModule } from 'layout';
import { PanelsModule } from 'panels';
import { EmptyLayoutComponent } from './components/empty-layout/empty-layout.component';
// import { PanelpageModule } from 'panelpage';

@NgModule({
  declarations: [PaneContentHostDirective, EmptyLayoutComponent, RenderPanelComponent, RenderPaneComponent, LayoutRendererHostDirective, PanelPageComponent ],
  imports: [
    CommonModule,
    // HttpClientModule,
    FormsModule,
    UtilsModule,
    ReactiveFormsModule,
    PanelsModule,
    LayoutModule
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
  ) {
  }
}
