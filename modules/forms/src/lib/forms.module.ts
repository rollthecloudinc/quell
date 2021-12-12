import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'material';
import { ContentPluginManager } from 'content';
import { StylePluginManager } from 'panels';
import { FormInputComponent } from './components/form-input/form-input.component';
import { FormSelectComponent } from './components/form-select/form-select.component';
import { formInputPluginFactory, formSectionStylePluginFactory, formSelectPluginFactory } from './forms.factories';
import { FormInputHandler } from './handlers/form-input.handler';
import { FormSelectHandler } from './handlers/form-select.handler';
import { FormSectionComponent } from './components/form-section/form-section.component';
import { RenderModule } from 'render';

@NgModule({
  declarations: [
    FormInputComponent,
    FormSelectComponent,
    FormSectionComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RenderModule
  ],
  exports: [
    FormInputComponent,
    FormSelectComponent
  ],
  providers: [
    FormInputHandler,
    FormSelectHandler,
    FormSectionComponent
  ]
})
export class FormsModule { 
  constructor(
    cpm: ContentPluginManager,
    spm: StylePluginManager,
    inputHandler: FormInputHandler,
    selectHandler: FormSelectHandler
  ) {
    [
      formInputPluginFactory({ handler: inputHandler }),
      formSelectPluginFactory({ handler: selectHandler })
    ].forEach(p => cpm.register(p));
    [
      formSectionStylePluginFactory()
    ].forEach(p => spm.register(p));
  }
}
