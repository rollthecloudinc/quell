import { NgModule } from '@angular/core';
import { staticParamFactory, inputParamFactory } from './dparam.factories';
import { ParamPluginManager } from './services/param-plugin-manager.service';
import { ParamsFormComponent } from './components/params-form/params-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@rollthecloudinc/material';
import { ParamEvaluatorService } from './services/param-evaluator.service';
import { ParamsQuerystringComponent } from './components/params-querystring/params-querystring.component';
import { PluginInstanceComponent } from './components/plugin-instance/plugin-instance.component';
@NgModule({
  declarations: [
    ParamsFormComponent,
    ParamsQuerystringComponent,
    PluginInstanceComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    ParamsFormComponent,
    ParamsQuerystringComponent,
    PluginInstanceComponent
  ]
})
export class DparamModule { 
  constructor(
    ppm: ParamPluginManager,
    paramEvaluatorService: ParamEvaluatorService
  ) {
    // For now kill this.
    ppm.register(staticParamFactory());
    ppm.register(inputParamFactory(paramEvaluatorService));
  }
}
