import { NgModule } from '@angular/core';
import { ReactiveFormsModule  } from '@angular/forms';
import { FormlyModule as RealFormlyModule }  from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { ContentPluginManager } from 'content';
import { MaterialModule } from 'material';
import { FormlyFieldContentHandler } from './handlers/formly-field-content.handler';
import { FormlyFieldEditorComponent } from './components/formly-field-editor/formly-field-editor.component';
import { FormlyFieldRendererComponent } from './components/formly-field-renderer/formly-field-renderer.component';
import { FormlyFieldSelectorComponent } from './components/formly-field-selector/formly-field-selector.component';
import { formlyFieldContentPluginFactory } from './formly.factories';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    FormlyFieldEditorComponent,
    FormlyFieldRendererComponent,
    FormlyFieldSelectorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    RealFormlyModule.forChild(),
    FormlyMaterialModule
  ],
  exports: [
    FormlyFieldEditorComponent,
    FormlyFieldRendererComponent,
    FormlyFieldSelectorComponent
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