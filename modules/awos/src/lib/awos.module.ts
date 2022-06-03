import { Inject, NgModule, Optional, PLATFORM_ID } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AuthFacade, AuthModule } from '@rollthecloudinc/auth';
import { CognitoSettings, COGNITO_SETTINGS } from '@rollthecloudinc/awcog';
import { CrudAdaptorPluginManager, CrudModule } from '@rollthecloudinc/crud';
import { ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { opensearchEntityCrudAdaptorPluginFactory, opensearchTemplateCrudAdaptorPluginFactory } from './awos.factories';
import { APP_BASE_HREF } from '@angular/common';
import { HOST_NAME, PROTOCOL } from '@rollthecloudinc/utils';
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
    @Inject(PLATFORM_ID) platformId: Object,
    cpm: CrudAdaptorPluginManager,
    authFacade: AuthFacade,
    paramsEvaluatorService: ParamEvaluatorService,
    http: HttpClient
  ) {
    cpm.register(opensearchTemplateCrudAdaptorPluginFactory(platformId, authFacade, cognitoSettings, paramsEvaluatorService, http));
    cpm.register(opensearchEntityCrudAdaptorPluginFactory(authFacade, cognitoSettings, paramsEvaluatorService, http));
  }
}
