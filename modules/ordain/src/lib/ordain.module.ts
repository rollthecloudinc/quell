
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@rollthecloudinc/material';
import { ValidationEditorComponent } from './components/validation-editor/validation-editor.component';
import { ValidationValidatorComponent } from './components/validation-validator/validation-validator.component';

@NgModule({
  declarations: [
    ValidationEditorComponent,
    ValidationValidatorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    ValidationEditorComponent
  ]
})
export class OrdainModule { }
