import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MaterialModule } from 'material';
import { EditablePaneComponent } from './components/editable-pane/editable-pane.component';
import { PaneContentHostDirective } from './directives/pane-content-host.directive';
import { ContentModule } from 'content';
import { PanelsModule } from 'panels';
import { ContextModule } from 'context';
import { AttributesModule } from 'attributes';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    PaneContentHostDirective,
    EditablePaneComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    AttributesModule,
    ContentModule,
    PanelsModule,
    ContextModule
  ],
  exports: [
    PaneContentHostDirective,
    EditablePaneComponent
  ],
  schemas: [
    // @todo: Work around to allow content-editor to be used for now without a whole bunch of misery.
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class EditablepaneModule { }
