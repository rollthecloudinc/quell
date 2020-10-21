import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { UserManager } from 'oidc-client';
import { switchMap, tap } from 'rxjs/operators';

import {
  SetUser,
  AuthActionTypes
} from './auth.actions';
import { Observable } from 'rxjs';

@Injectable()
export class AuthEffects {

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.Login),
      tap(() => {
        this.userManager.signinRedirect();
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActionTypes.Logout),
    tap(() => {
      this.userManager.signoutRedirect();
    })
  ),
  { dispatch: false }
);

  completeAuthentication$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.CompleteAuthentication),
      switchMap(() => new Observable<SetUser>(sub => {
          this.userManager.signinRedirectCallback().then(user => {
            sub.next(new SetUser(user));
            sub.complete();
          });
        })
      )
    )
  );

  constructor(
    private actions$: Actions,
    private userManager: UserManager
  ) {}
}
