import { Injectable } from '@angular/core';
import { ContextResolver } from '../models/context.models';
import { Observable, of } from 'rxjs';
import { getSelectors, RouterReducerState } from '@ngrx/router-store';
import { Store, select } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { ContextPlugin } from '../models/context.models';

@Injectable()
export class RouteResolver implements ContextResolver {

  constructor(private routerStore: Store<RouterReducerState>) { }

  resolve(ctx: ContextPlugin, data?: any): Observable<any> {
    const { selectCurrentRoute } = getSelectors((state: any) => state.router);
    return this.routerStore.pipe(
      select(selectCurrentRoute),
      map(route => {
        const obj = {
          path: `/pages/panelpage/${route.params.panelPageId}`
        };
        //console.log(route);
        /*for(const prop in route.params) {
          if(prop.indexOf('arg') === 0) {
            obj[prop] = route.params[prop];
          }
        }*/
        return obj;
      })
      //take(1)
    );
  }
}
