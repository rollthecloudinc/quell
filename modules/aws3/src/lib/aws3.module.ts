import { Inject, NgModule } from '@angular/core';
import { CrudModule, CrudAdaptorPluginManager } from 'crud';
import { AuthFacade, AuthModule } from 'auth';
import { CognitoSettings, COGNITO_SETTINGS } from 'awcog';
import { s3EntityCrudAdaptorPluginFactory } from './aws3.factories';
import { ParamEvaluatorService } from 'dparam';
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
    @Inject(COGNITO_SETTINGS) cognitoSettings: CognitoSettings,
    cpm: CrudAdaptorPluginManager,
    authFacade: AuthFacade,
    paramsEvaluatorService: ParamEvaluatorService
  ) {
    cpm.register(s3EntityCrudAdaptorPluginFactory(authFacade, cognitoSettings, paramsEvaluatorService));
  }
}