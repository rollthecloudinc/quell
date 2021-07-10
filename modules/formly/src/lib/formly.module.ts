import { NgModule } from '@angular/core';
import { ReactiveFormsModule  } from '@angular/forms';
import { FormlyModule as RealFormlyModule }  from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';
import { ContentPluginManager } from 'content';
import { MaterialModule } from 'material';
import { FormlyFieldContentHandler } from './handlers/formly-field-content.handler';
import { FormlyFieldEditorComponent } from './components/formly-field-editor/formly-field-editor.component';
import { FormlyFieldRendererComponent } from './components/formly-field-renderer/formly-field-renderer.component';
import { FormlyFieldSelectorComponent } from './components/formly-field-selector/formly-field-selector.component';
import { FormlyPaneFieldComponent } from './components/formly-pane-field/formly-pane-field.component';
import { formlyFieldContentPluginFactory } from './formly.factories';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RestModule } from 'rest';
import { DatasourceModule } from 'datasource';

@NgModule({
  declarations: [
    FormlyFieldEditorComponent,
    FormlyFieldRendererComponent,
    FormlyFieldSelectorComponent,
    FormlyPaneFieldComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    RealFormlyModule.forChild(),
    FormlyMaterialModule,
    FormlyMatDatepickerModule,
    RestModule,
    DatasourceModule
  ],
  exports: [
    FormlyFieldEditorComponent,
    FormlyFieldRendererComponent,
    FormlyFieldSelectorComponent,
    FormlyPaneFieldComponent
  ],
  providers: [
    FormlyFieldContentHandler
  ]
})
export class FormlyModule { 
  constructor(
    cpm: ContentPluginManager,
    handler: FormlyFieldContentHandler
  ) {
    cpm.register(formlyFieldContentPluginFactory(handler));
  }
}
