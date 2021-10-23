import { NgModule } from '@angular/core';
import { CrudModule, CrudAdaptorPluginManager } from 'crud';
import { AuthFacade, AuthModule } from 'auth';
import { s3EntityCrudAdaptorPluginFactory } from './aws3.factories';

@NgModule({
  declarations: [],
  imports: [
    AuthModule,
    CrudModule
  ],
  exports: []
})
export class Aws3Module { 
  constructor(
    cpm: CrudAdaptorPluginManager,
    authFacade: AuthFacade
  ) {
    cpm.register(s3EntityCrudAdaptorPluginFactory(authFacade));
  }
}
