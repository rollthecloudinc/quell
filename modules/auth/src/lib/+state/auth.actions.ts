import { Action } from '@ngrx/store';
import { User } from 'oidc-client';

export enum AuthActionTypes {
  Login = '[Auth] Login',
  Logout = '[Auth] Logout',
  CompleteAuthentication = '[Auth] CompleteAuthentication',
  SetUser = '[Auth] SetUser'
}

export class Login implements Action {
  readonly type = AuthActionTypes.Login;
}

export class Logout implements Action {
  readonly type = AuthActionTypes.Logout;
}

export class CompleteAuthentication implements Action {
  readonly type = AuthActionTypes.CompleteAuthentication;
}

export class SetUser implements Action {
  readonly type = AuthActionTypes.SetUser;
  constructor(public payload: User) {}
}

/*export class SetUser implements Action {
  readonly type = AuthActionTypes.SetUser;
  constructor(public payload: any) {}
}*/

export type AuthAction = Login | Logout | CompleteAuthentication | SetUser;

export const fromAuthActions = {
  Login,
  Logout,
  CompleteAuthentication,
  SetUser
};
