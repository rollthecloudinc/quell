import { TestBed, waitForAsync } from '@angular/core/testing';

import { Observable } from 'rxjs';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

// import { NxModule, DataPersistence } from '@nrwl/angular';
// import { hot } from '@nrwl/angular/testing';

// import { AuthEffects } from './auth.effects';
// import { LoadAuth, AuthLoaded } from './auth.actions';

/*describe('AuthEffects', () => {
  let actions: Observable<any>;
  let effects: AuthEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NxModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([])
      ],
      providers: [
        AuthEffects,
        DataPersistence,
        provideMockActions(() => actions)
      ]
    });

    effects = TestBed.get(AuthEffects);
  });

  describe('loadAuth$', () => {
    it('should work', () => {
      actions = hot('-a-|', { a: new LoadAuth() });
      expect(effects.loadAuth$).toBeObservable(
        hot('-a-|', { a: new AuthLoaded([]) })
      );
    });
  });
});*/
