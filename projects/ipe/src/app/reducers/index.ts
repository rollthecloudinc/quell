import {
  ActionReducer,
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
// import { localStorageSync } from 'ngrx-store-localstorage';
// import { environment } from '../../environments/environment';

export interface AppState {
  router: fromRouter.RouterReducerState;
}

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer
};

// @todo: I would like to put this inside auth.
/*export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({keys: ['auth'], rehydrate: true })(reducer);
}*/

// export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [localStorageSyncReducer] : [localStorageSyncReducer];
export const metaReducers: MetaReducer<AppState>[] = [];
