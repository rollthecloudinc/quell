import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule as NgFormsModule } from '@angular/forms';
import { MaterialModule } from 'material';
import { ContentPluginManager } from 'content';
import { StylePluginManager } from 'panels';
import { FormInputComponent } from './components/form-input/form-input.component';
import { FormSelectComponent } from './components/form-select/form-select.component';
import { formAutocompletePluginFactory, formCheckboxPluginFactory, formDatepickerPluginFactory, formInputPluginFactory, formRadiogroupPluginFactory, formSectionStylePluginFactory, formSelectPluginFactory, formSliderPluginFactory, formTextareaPluginFactory, formTogglePluginFactory } from './forms.factories';
import { FormSectionComponent } from './components/form-section/form-section.component';
import { FormTextareaComponent } from './components/form-textarea/form-textarea.component';
import { RenderModule } from 'render';
import { FormElementHandler } from './handlers/form-element.handler';
import { FormElementEditorComponent } from './components/form-element-editor/form-element-editor.component';
import { DatasourceModule } from 'datasource';
import { FormRadiogroupComponent } from './components/form-radiogroup/form-radiogroup.component';
import { FormSliderComponent } from './components/form-slider/form-slider.component';
import { FormToggleComponent } from './components/form-toggle/form-toggle.component';
import { FormCheckboxComponent } from './components/form-checkbox/form-checkbox.component';
import { FormDatepickerComponent } from './components/form-datepicker/form-datepicker.component';
import { FormAutocompleteComponent } from './components/form-autocomplete/form-autocomplete.component';
@NgModule({
  declarations: [
    FormInputComponent,
    FormSelectComponent,
    FormSectionComponent,
    FormTextareaComponent,
    FormElementEditorComponent,
    FormRadiogroupComponent,
    FormSliderComponent,
    FormToggleComponent,
    FormCheckboxComponent,
    FormDatepickerComponent,
    FormAutocompleteComponent
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
    FormElementEditorComponent,
    FormRadiogroupComponent,
    FormSliderComponent,
    FormToggleComponent,
    FormCheckboxComponent,
    FormDatepickerComponent,
    FormAutocompleteComponent
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
      formTextareaPluginFactory({ handler }),
      formRadiogroupPluginFactory({ handler }),
      formSliderPluginFactory({ handler }),
      formTogglePluginFactory({ handler }),
      formCheckboxPluginFactory({ handler }),
      formDatepickerPluginFactory({ handler }),
      formAutocompletePluginFactory({ handler })
    ].forEach(p => cpm.register(p));
    [
      formSectionStylePluginFactory()
    ].forEach(p => spm.register(p));
  }
}
