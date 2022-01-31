import { Inject, NgModule, Optional, PLATFORM_ID } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AuthFacade, AuthModule } from 'auth';
import { CognitoSettings, COGNITO_SETTINGS } from 'awcog';
import { CrudAdaptorPluginManager, CrudModule } from 'crud';
import { ParamEvaluatorService } from 'dparam';
import { opensearchEntityCrudAdaptorPluginFactory, opensearchTemplateCrudAdaptorPluginFactory } from './awos.factories';
import { APP_BASE_HREF } from '@angular/common';
import { HOST_NAME, PROTOCOL } from 'utils';

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
    @Optional() @Inject(HOST_NAME) hostName: string,
    @Optional() @Inject(PROTOCOL) protocol: string,
    @Inject(COGNITO_SETTINGS) cognitoSettings: CognitoSettings,
    @Inject(PLATFORM_ID) platformId: Object,
    cpm: CrudAdaptorPluginManager,
    authFacade: AuthFacade,
    paramsEvaluatorService: ParamEvaluatorService,
    http: HttpClient
  ) {
    cpm.register(opensearchTemplateCrudAdaptorPluginFactory(platformId, authFacade, cognitoSettings, paramsEvaluatorService, http, hostName, protocol));
    cpm.register(opensearchEntityCrudAdaptorPluginFactory(authFacade, cognitoSettings, paramsEvaluatorService));
  }
}