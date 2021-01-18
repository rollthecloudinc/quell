import { AuthAction, AuthActionTypes } from './auth.actions';
import { User } from 'oidc-client';
import { Cookie } from '../models/cookie.models';
// import { userInfo } from 'os';

export const AUTH_FEATURE_KEY = 'auth';

/**
 * Interface for the 'Auth' data used in
 *  - AuthState, and the reducer function
 *
 *  Note: replace if already defined in another module
 */

/* tslint:disable:no-empty-interface */
export interface Entity {}

export interface AuthState {
  user: User;
  cookies: Map<string, Cookie>;
  // user: any;
}

export interface AuthPartialState {
  readonly [AUTH_FEATURE_KEY]: AuthState;
}

export const initialState: AuthState = {
  user: undefined,
  cookies: new Map<string, Cookie>()
};

export function reducer(
  state: AuthState = initialState,
  action: AuthAction
): AuthState {
  switch (action.type) {
    case AuthActionTypes.SetUser: {
      state = {
        ...state,
        user: action.payload
      };
      break;
    }
    case AuthActionTypes.Logout: {
      state = {
        ...state,
        user: undefined
      }
      break;
    }
  }
  return state;
}
