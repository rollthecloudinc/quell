import { Inject, Injector, ModuleWithProviders, NgModule, Optional, PLATFORM_ID, TransferState, inject, provideAppInitializer } from '@angular/core';
import { EntityDefinitionService } from '@ngrx/data';
import { EffectsModule } from '@ngrx/effects';
import { AuthWebStorageService } from './services/auth-web-storage.service';
import { authWebStorageFactory, initAuthFactory, userManagerFactory } from './oidc.factories';
import { OidcAuthEffects } from './effects/oidc-auth.effects';
import { entityMetadata } from './entity-metadata';
import { CLIENT_SETTINGS } from './oidc.tokens';

import { UserManager } from 'oidc-client-ts';
import { AuthFacade, AuthModule } from '@rollthecloudinc/auth';
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
        provideAppInitializer(() => {
        const initializerFn = (initAuthFactory)(inject(UserManager), inject(AuthFacade), inject(PLATFORM_ID));
        return initializerFn();
      })
      ]
    };
  }
 }
