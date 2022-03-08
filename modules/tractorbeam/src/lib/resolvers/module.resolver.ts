import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ContextPlugin, ContextResolver } from 'context';

@Injectable()
export class ModuleResolver implements ContextResolver {

  constructor() { }

  resolve(ctx: ContextPlugin, data?: any, metadata?: Map<string, any>): Observable<any> {
    return of(true);
  }
}
