import { NgModule } from '@angular/core';
import { DparamModule, ParamPluginManager } from '@rollthecloudinc/dparam';
import { paramPagePluginFactory, paramSearchStringPluginFactory, paramRoutePluginFactory, paramQueryStringPluginFactory, paramStandardPaginationPluginFactory } from './durl.factories';

@NgModule({
  declarations: [],
  imports: [
    DparamModule
  ],
  exports: []
})
export class DurlModule { 
  constructor(
    ppm: ParamPluginManager
  ) {
    [
      paramPagePluginFactory(), 
      paramSearchStringPluginFactory(), 
      paramRoutePluginFactory(), 
      paramQueryStringPluginFactory(), 
      paramStandardPaginationPluginFactory()
    ].forEach(p => ppm.register(p));
  }
}
