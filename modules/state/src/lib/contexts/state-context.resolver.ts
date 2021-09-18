import { Injectable } from '@angular/core';
import { ContextResolver, ContextPlugin } from 'context';
import { Observable, of } from 'rxjs';

@Injectable()
export class StateContextResolver implements ContextResolver {

  constructor() { }

  resolve(ctx: ContextPlugin, data?: any): Observable<any> {
    return of(data.state);
  }

}
