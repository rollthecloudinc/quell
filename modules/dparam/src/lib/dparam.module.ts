import { NgModule } from '@angular/core';
import { staticParamFactory } from './dparam.factories';
import { ParamPluginManager } from './services/param-plugin-manager.service';
@NgModule({
  declarations: [],
  imports: [
  ],
  exports: []
})
export class DparamModule { 
  constructor(
    ppm: ParamPluginManager
  ) {
    ppm.register(staticParamFactory());
  }
}
