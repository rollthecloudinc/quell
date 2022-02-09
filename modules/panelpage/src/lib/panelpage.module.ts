import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { EMBEDDABLE_COMPONENT, UtilsModule } from 'utils';
import { LayoutRendererHostDirective } from './directives/layout-renderer-host.directive';
import { PanelPageComponent } from './components/panel-page/panel-page.component';
import { LayoutModule } from 'layout';
import { PanelsModule } from 'panels';

@NgModule({
  declarations: [
    LayoutRendererHostDirective,
    PanelPageComponent
  ],
  imports: [
    CommonModule,
    // HttpClientModule,
    FormsModule,
    UtilsModule,
    ReactiveFormsModule,
    PanelsModule,
    LayoutModule
  ],
  exports: [
    LayoutRendererHostDirective,
    PanelPageComponent
  ],
  providers: [
    { provide: EMBEDDABLE_COMPONENT, useValue: PanelPageComponent, multi: true }
  ],
  schemas: [
    // @todo: Work around to allow render-panel to be used for now without a whole bunch of misery.
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class PanelpageModule { }
