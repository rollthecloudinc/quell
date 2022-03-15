import { NgModule } from '@angular/core';
import { ReactiveFormsModule  } from '@angular/forms';
import { FormlyModule as RealFormlyModule }  from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';
import { ContentModule, ContentPluginManager } from '@ng-druid/content';
import { MaterialModule } from '@ng-druid/material';
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
import { RestModule } from '@ng-druid/rest';
import { DatasourceModule } from '@ng-druid/datasource';
import { DurlModule } from '@ng-druid/durl';
import { FormlyMatNativeSelectModule } from '@ngx-formly/material/native-select';
import { FormlyMatToggleModule } from '@ngx-formly/material/toggle';
import { FormlyMatSliderModule } from '@ngx-formly/material/slider';
import { FormlyRepeatingRendererComponent } from './components/formly-repeating-renderer/formly-repeating-renderer.component';
import { StylePluginManager } from '@ng-druid/panels';
import { FormlyFieldWrapperComponent } from './components/formly-field-wrapper/formly-field-wrapper.component';
import { FormlyRepeatingEditorComponent } from './components/formly-repeating-editor/formly-repeating-editor.component';
import { FormlyPanelPageComponent } from './components/formly-panel-page/formly-panel-page.component';
import { RenderModule } from '@ng-druid/render';
// import { PanelpageModule } from 'panelpage';

@NgModule({
  declarations: [
    FormlyFieldEditorComponent,
    FormlyFieldRendererComponent,
    FormlyFieldSelectorComponent,
    FormlyPaneFieldComponent,
    FormlyAutocompleteComponent,
    FormlyRepeatingSectionComponent,
    FormlyRepeatingRendererComponent,
    FormlyFieldWrapperComponent,
    FormlyRepeatingEditorComponent,
    FormlyPanelPageComponent
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
        {
          name: 'panelpage',
          component: FormlyPanelPageComponent,
          // wrappers: ['form-field'],
        }
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
    ContentModule,
    RestModule,
    DatasourceModule,
    DurlModule,
    RenderModule,
    // PanelpageModule
  ],
  exports: [
    FormlyFieldEditorComponent,
    FormlyFieldRendererComponent,
    FormlyFieldSelectorComponent,
    FormlyPaneFieldComponent,
    FormlyAutocompleteComponent,
    FormlyRepeatingSectionComponent,
    FormlyRepeatingRendererComponent,
    FormlyFieldWrapperComponent,
    FormlyRepeatingEditorComponent,
    FormlyPanelPageComponent
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
