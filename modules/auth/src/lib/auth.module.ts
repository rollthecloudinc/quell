import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import {} from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import * as fromAuth from './+state/auth.reducer';
import { AuthFacade } from './+state/auth.facade';
import { EntityDefinitionService } from '@ngrx/data';
import { entityMetadata } from './entity-metadata';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';

@NgModule({
  declarations: [ AuthCallbackComponent ],
  imports: [
    CommonModule,
    // HttpClientModule,
    StoreModule.forFeature(fromAuth.AUTH_FEATURE_KEY, fromAuth.reducer),
    // EffectsModule.forFeature([AuthEffects])
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
        AuthFacade
      ]
    };
  }
}
