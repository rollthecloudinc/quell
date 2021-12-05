import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { EMBEDDABLE_COMPONENT } from 'utils';
import { LayoutRendererHostDirective } from './directives/layout-renderer-host.directive';
import { PanelPageComponent } from './components/panel-page/panel-page.component';
import { PaneContentHostDirective } from './directives/pane-content-host.directive';
import { RenderPanelComponent } from './components/render-panel/render-panel.component';
import { RenderPaneComponent } from './components/render-pane/render-pane.component';
import { LayoutModule } from 'layout';
import { PanelsModule } from 'panels';

@NgModule({
  declarations: [LayoutRendererHostDirective, PanelPageComponent, PaneContentHostDirective, RenderPanelComponent, RenderPaneComponent],
  imports: [
    CommonModule,
    // HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    PanelsModule,
    LayoutModule
  ],
  exports: [
    PanelPageComponent,
    RenderPanelComponent,
    RenderPaneComponent
  ],
  providers: [
    { provide: EMBEDDABLE_COMPONENT, useValue: PanelPageComponent, multi: true }
  ]
})
export class RenderModule { 
  constructor(
  ) {
  }
}
