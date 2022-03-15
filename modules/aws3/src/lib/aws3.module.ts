import { Inject, NgModule, Optional, PLATFORM_ID } from '@angular/core';
import { CrudModule, CrudAdaptorPluginManager } from '@ng-druid/crud';
import { AuthFacade, AuthModule } from '@ng-druid/auth';
import { CognitoSettings, COGNITO_SETTINGS } from '@ng-druid/awcog';
import { s3EntityCrudAdaptorPluginFactory } from './aws3.factories';
import { ParamEvaluatorService } from '@ng-druid/dparam';
import { HttpClient } from '@angular/common/http';
import { UtilsModule, AsyncApiCallHelperService, HOST_NAME, PROTOCOL } from '@ng-druid/utils';
import { APP_BASE_HREF } from '@angular/common';
@NgModule({
  declarations: [],
  imports: [
    UtilsModule,
    AuthModule,
    CrudModule
  ],
  exports: []
})
export class Aws3Module { 
  constructor(
    @Inject(COGNITO_SETTINGS) cognitoSettings: CognitoSettings,
    @Inject(PLATFORM_ID) platformId: Object,
    cpm: CrudAdaptorPluginManager,
    authFacade: AuthFacade,
    paramsEvaluatorService: ParamEvaluatorService,
    http: HttpClient,
    asyncApiCallHelperSvc: AsyncApiCallHelperService
  ) {
    cpm.register(s3EntityCrudAdaptorPluginFactory(platformId, authFacade, cognitoSettings, paramsEvaluatorService, http, asyncApiCallHelperSvc));
  }
}
