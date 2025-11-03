import { Inject, Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { ofEntityType, ofEntityOp, EntityOp, EntityActionFactory } from '@ngrx/data';
import { UserManager } from 'oidc-client-ts';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthActions } from '@rollthecloudinc/auth';
import { Observable } from 'rxjs';
import * as Cookies from 'js-cookie';

@Injectable()
export class OidcAuthEffects {

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.AuthActionTypes.Login),
      tap(() => {
        this.userManager.signinRedirect();
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.AuthActionTypes.Logout),
    tap(() => {
      this.userManager.signoutRedirect();
    })
  ),
  { dispatch: false }
);

  completeAuthentication$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.AuthActionTypes.CompleteAuthentication),
      switchMap(() => new Observable<AuthActions.SetUser>(sub => {
          this.userManager.signinRedirectCallback().then(user => {
            sub.next(new AuthActions.SetUser(user));
            sub.complete();
          });
        })
      )
    )
  );

  /*setUser = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.SetUser),
      map(() => this.entityActionFactory.create<Cookie>('Cookie', EntityOp.QUERY_ALL))
    )
  );*/

  loadCookies$ = createEffect(() =>
    this.actions$.pipe(
      ofEntityType('Cookie'),
      ofEntityOp([EntityOp.QUERY_ALL_SUCCESS]),
      tap(action => console.log(action.payload.data)),
      tap(action => {
        // action.payload.data.forEach(c => Cookies.set(c.name, c.value, { expires: new Date(new Date().getTime() + 1 * 3600 * 1000) }));
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    @Inject(UserManager) private userManager: UserManager,
    private entityActionFactory: EntityActionFactory
  ) {
  }
}
