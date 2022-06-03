import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { ofEntityType, ofEntityOp, EntityOp, EntityActionFactory } from '@ngrx/data';
import { map, tap } from 'rxjs/operators';
import { Cookie, AuthActions } from '@rollthecloudinc/auth';
import * as Cookies from 'js-cookie';

@Injectable()
export class CognitoAuthEffects {

  setUser = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.AuthActionTypes.SetUser),
      map(() => this.entityActionFactory.create<Cookie>('Cookie', EntityOp.QUERY_ALL))
    )
  );

  loadCookies$ = createEffect(() =>
    this.actions$.pipe(
      ofEntityType('Cookie'),
      ofEntityOp([EntityOp.QUERY_ALL_SUCCESS]),
      tap(action => console.log(action.payload.data)),
      tap(action => {
        action.payload.data.forEach(c => Cookies.set(c.name, c.value, { expires: new Date(new Date().getTime() + 1 * 3600 * 1000) }));
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private entityActionFactory: EntityActionFactory
  ) {
  }
}
