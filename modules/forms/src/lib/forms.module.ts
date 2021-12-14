import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule as NgFormsModule } from '@angular/forms';
import { MaterialModule } from 'material';
import { ContentPluginManager } from 'content';
import { StylePluginManager } from 'panels';
import { FormInputComponent } from './components/form-input/form-input.component';
import { FormSelectComponent } from './components/form-select/form-select.component';
import { formInputPluginFactory, formSectionStylePluginFactory, formSelectPluginFactory, formTextareaPluginFactory } from './forms.factories';
import { FormSectionComponent } from './components/form-section/form-section.component';
import { FormTextareaComponent } from './components/form-textarea/form-textarea.component';
import { RenderModule } from 'render';
import { FormElementHandler } from './handlers/form-element.handler';
import { FormElementEditorComponent } from './components/form-element-editor/form-element-editor.component';
import { DatasourceModule } from 'datasource';
@NgModule({
  declarations: [
    FormInputComponent,
    FormSelectComponent,
    FormSectionComponent,
    FormTextareaComponent,
    FormElementEditorComponent
  ],
  imports: [
    CommonModule,
    NgFormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RenderModule,
    DatasourceModule
  ],
  exports: [
    FormInputComponent,
    FormSelectComponent,
    FormSectionComponent,
    FormElementEditorComponent
  ]
})
export class FormsModule { 
  constructor(
    cpm: ContentPluginManager,
    spm: StylePluginManager,
    handler: FormElementHandler
  ) {
    [
      formInputPluginFactory({ handler }),
      formSelectPluginFactory({ handler }),
      formTextareaPluginFactory({ handler })
    ].forEach(p => cpm.register(p));
    [
      formSectionStylePluginFactory()
    ].forEach(p => spm.register(p));
  }
}
