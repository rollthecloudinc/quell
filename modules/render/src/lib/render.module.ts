import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { EMBEDDABLE_COMPONENT, UtilsModule } from 'utils';
import { PaneContentHostDirective } from './directives/pane-content-host.directive';
import { RenderPanelComponent } from './components/render-panel/render-panel.component';
import { RenderPaneComponent } from './components/render-pane/render-pane.component';
import { LayoutModule } from 'layout';
import { PanelsModule } from 'panels';
import { PanelpageModule } from 'panelpage';

@NgModule({
  declarations: [PaneContentHostDirective, RenderPanelComponent, RenderPaneComponent],
  imports: [
    CommonModule,
    // HttpClientModule,
    FormsModule,
    UtilsModule,
    ReactiveFormsModule,
    PanelsModule,
    LayoutModule,
    PanelpageModule
  ],
  exports: [
    RenderPanelComponent,
    RenderPaneComponent
  ]
})
export class RenderModule { 
  constructor(
  ) {
  }
}
