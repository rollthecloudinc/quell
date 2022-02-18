import { APP_INITIALIZER, Inject, Injector, ModuleWithProviders, NgModule, Optional, PLATFORM_ID } from '@angular/core';
import { EntityDefinitionService } from '@ngrx/data';
import { EffectsModule } from '@ngrx/effects';
import { AuthWebStorageService } from './services/auth-web-storage.service';
import { authWebStorageFactory, initAuthFactory, userManagerFactory } from './oidc.factories';
import { OidcAuthEffects } from './effects/oidc-auth.effects';
import { entityMetadata } from './entity-metadata';
import { CLIENT_SETTINGS } from './oidc.tokens';
import { TransferState } from '@angular/platform-browser';
import { UserManager } from 'oidc-client';
import { AuthFacade, AuthModule } from 'auth';
@NgModule({
  declarations: [],
  imports: [
    AuthModule,
    EffectsModule.forFeature([OidcAuthEffects])
  ],
  exports: []
})
export class OidcModule {
  constructor(
    eds: EntityDefinitionService
  ) {
    eds.registerMetadataMap(entityMetadata);
  }
  static forRoot(): ModuleWithProviders<OidcModule> {
    return {
      ngModule: OidcModule,
      providers: [
        { provide: AuthWebStorageService, useFactory: authWebStorageFactory, deps: [CLIENT_SETTINGS, PLATFORM_ID, Injector, TransferState ] },
        { provide: UserManager, useFactory: userManagerFactory, deps: [CLIENT_SETTINGS, AuthWebStorageService] },
        { provide: APP_INITIALIZER, useFactory: initAuthFactory, multi: true, deps: [UserManager, AuthFacade, PLATFORM_ID] }
      ]
    };
  }
 }
