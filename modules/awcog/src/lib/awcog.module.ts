import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { CognitoAuthEffects } from './effects/cognito-auth.effects';

@NgModule({
  declarations: [],
  imports: [
    EffectsModule.forFeature([CognitoAuthEffects])
  ],
  exports: []
})
export class AwcogModule { }
