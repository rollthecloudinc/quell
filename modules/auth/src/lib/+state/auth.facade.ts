import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { User } from 'oidc-client';

import { select, Store } from '@ngrx/store';

import { AuthPartialState } from './auth.reducer';
import { authQuery } from './auth.selectors';
import { CompleteAuthentication, Login, Logout, SetUser } from './auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  getUser$ = this.store.pipe(select(authQuery.getUser));
  token$ = this.store.pipe(select(authQuery.getUser), map(u => u ? `${u.token_type} ${u.access_token}` : undefined));

  constructor(private store: Store<AuthPartialState>) {}

  login() {
    this.store.dispatch(new Login());
  }

  logout() {
    this.store.dispatch(new Logout());
  }

  setUser(user: User) {
    this.store.dispatch(new SetUser(user));
  }

  completeAuthentication() {
    this.store.dispatch(new CompleteAuthentication());
  }

}
