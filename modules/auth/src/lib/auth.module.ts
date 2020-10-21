import { NgModule, APP_INITIALIZER, PLATFORM_ID, ModuleWithProviders, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import * as fromAuth from './+state/auth.reducer';
import { EffectsModule } from '@ngrx/effects';
import { UserManager } from 'oidc-client';
import { AuthEffects } from './+state/auth.effects';
import { AuthFacade } from './+state/auth.facade';
import { userManagerFactory } from './auth.factories';
import { CLIENT_SETTINGS } from './auth.tokens';
import { EntityDefinitionService } from '@ngrx/data';
import { initAuthFactory, authWebStorageFactory } from './auth.factories';
import { AuthWebStorageService } from './services/auth-web-storage.service';
import { entityMetadata } from './entity-metadata';
import { TransferState } from '@angular/platform-browser';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';

@NgModule({
  declarations: [ AuthCallbackComponent ],
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature(fromAuth.AUTH_FEATURE_KEY, fromAuth.reducer),
    EffectsModule.forFeature([AuthEffects])
  ],
  exports: [ AuthCallbackComponent ]
})
export class AuthModule {
  constructor(eds: EntityDefinitionService) {
    eds.registerMetadataMap(entityMetadata);
  }
  static forRoot(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        AuthFacade,
        { provide: AuthWebStorageService, useFactory: authWebStorageFactory, deps: [CLIENT_SETTINGS, PLATFORM_ID, Injector, TransferState ] },
        { provide: UserManager, useFactory: userManagerFactory, deps: [CLIENT_SETTINGS, AuthWebStorageService] },
        { provide: APP_INITIALIZER, useFactory: initAuthFactory, multi: true, deps: [UserManager, AuthFacade, PLATFORM_ID] }
      ]
    };
  }
}
