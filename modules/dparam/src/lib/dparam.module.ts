import { NgModule } from '@angular/core';
import { staticParamFactory } from './dparam.factories';
import { ParamPluginManager } from './services/param-plugin-manager.service';
import { ParamsFormComponent } from './components/params-form/params-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'material';
@NgModule({
  declarations: [
    ParamsFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    ParamsFormComponent
  ]
})
export class DparamModule { 
  constructor(
    ppm: ParamPluginManager
  ) {
    // For now kill this.
    // ppm.register(staticParamFactory());
  }
}
