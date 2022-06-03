import { NgModule } from '@angular/core';
import { CrudAdaptorPluginManager, CrudModule } from '@rollthecloudinc/crud';
import { ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { idbEntityCrudAdaptorPluginFactory } from './keyval.factories';

@NgModule({
  declarations: [],
  imports: [
    CrudModule
  ],
  exports: []
})
export class KeyvalModule { 
  constructor(
    cpm: CrudAdaptorPluginManager,
    paramsEvaluatorService: ParamEvaluatorService
  ) {
    cpm.register(idbEntityCrudAdaptorPluginFactory(paramsEvaluatorService));
  }
}
