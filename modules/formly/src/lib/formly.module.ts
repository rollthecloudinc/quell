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
import { FormlyAutocompleteComponent } from './components/formly-autocomplete/formly-autocomplete.component';
import { FormlyRepeatingSectionComponent } from './components/formly-repeating-section/formly-repeating-section.component';
import { formlyFieldContentPluginFactory, formlyRepeatingStyleFactory } from './formly.factories';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RestModule } from 'rest';
import { DatasourceModule } from 'datasource';
import { DurlModule } from 'durl';
import { FormlyMatNativeSelectModule } from '@ngx-formly/material/native-select';
import { FormlyMatToggleModule } from '@ngx-formly/material/toggle';
import { FormlyMatSliderModule } from '@ngx-formly/material/slider';
import { FormlyRepeatingRendererComponent } from './components/formly-repeating-renderer/formly-repeating-renderer.component';
import { StylePluginManager } from 'panels';
import { FormlyFieldWrapperComponent } from './components/formly-field-wrapper/formly-field-wrapper.component';

@NgModule({
  declarations: [
    FormlyFieldEditorComponent,
    FormlyFieldRendererComponent,
    FormlyFieldSelectorComponent,
    FormlyPaneFieldComponent,
    FormlyAutocompleteComponent,
    FormlyRepeatingSectionComponent,
    FormlyRepeatingRendererComponent,
    FormlyFieldWrapperComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    RealFormlyModule.forChild({
      types: [
        {
          name: 'autocomplete',
          component: FormlyAutocompleteComponent,
          wrappers: ['form-field'],
        },
        {
          name: 'repeat',
          component: FormlyRepeatingSectionComponent,
          // wrappers: ['form-field'],
        },
      ],
      wrappers: [
        { name: 'imaginary-pane', component: FormlyFieldWrapperComponent },
      ]
    }),
    FormlyMaterialModule,
    FormlyMatDatepickerModule,
    FormlyMatNativeSelectModule,
    FormlyMatToggleModule,
    FormlyMatSliderModule,
    RestModule,
    DatasourceModule,
    DurlModule
  ],
  exports: [
    FormlyFieldEditorComponent,
    FormlyFieldRendererComponent,
    FormlyFieldSelectorComponent,
    FormlyPaneFieldComponent,
    FormlyAutocompleteComponent,
    FormlyRepeatingSectionComponent,
    FormlyRepeatingRendererComponent,
    FormlyFieldWrapperComponent
  ],
  providers: [
    FormlyFieldContentHandler
  ]
})
export class FormlyModule { 
  constructor(
    cpm: ContentPluginManager,
    handler: FormlyFieldContentHandler,
    spm: StylePluginManager
  ) {
    cpm.register(formlyFieldContentPluginFactory(handler));
    spm.register(formlyRepeatingStyleFactory());
  }
}
