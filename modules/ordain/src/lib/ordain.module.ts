
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@rollthecloudinc/material';
import { DparamModule } from '@rollthecloudinc/dparam';
import { ValidationEditorComponent } from './components/validation-editor/validation-editor.component';
import { ValidationValidatorComponent } from './components/validation-validator/validation-validator.component';
import { ValidationRendererHostDirective } from './directives/validation-renderer-host.directive';
import { ValidationParamsEditorComponent } from './components/validation-params-editor/validation-params-editor.component';
import { ValidationParamsEditorFormComponent } from './components/validation-params-editor-form/validation-params-editor-form.component';

@NgModule({
  declarations: [
    ValidationEditorComponent,
    ValidationValidatorComponent,
    ValidationRendererHostDirective,
    ValidationParamsEditorComponent,
    ValidationParamsEditorFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    DparamModule
  ],
  exports: [
    ValidationEditorComponent,
    ValidationParamsEditorComponent
  ]
})
export class OrdainModule { }
