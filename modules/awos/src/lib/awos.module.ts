import { Inject, NgModule } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AuthFacade, AuthModule } from 'auth';
import { CognitoSettings, COGNITO_SETTINGS } from 'awcog';
import { CrudAdaptorPluginManager, CrudModule } from 'crud';
import { ParamEvaluatorService } from 'dparam';
import { opensearchEntityCrudAdaptorPluginFactory, opensearchTemplateCrudAdaptorPluginFactory } from './awos.feactories';

@NgModule({
  declarations: [
  ],
  imports: [
    AuthModule,
    CrudModule
  ],
  exports: [
  ]
})
export class AwosModule { 
  constructor(
    @Inject(COGNITO_SETTINGS) cognitoSettings: CognitoSettings,
    cpm: CrudAdaptorPluginManager,
    authFacade: AuthFacade,
    paramsEvaluatorService: ParamEvaluatorService,
    http: HttpClient
  ) {
    cpm.register(opensearchTemplateCrudAdaptorPluginFactory(authFacade, cognitoSettings, paramsEvaluatorService, http));
    cpm.register(opensearchEntityCrudAdaptorPluginFactory(authFacade, cognitoSettings, paramsEvaluatorService));
  }
}
