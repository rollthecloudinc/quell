import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ContextPlugin, ContextResolver } from 'context';
import { loadRemoteModule } from '@angular-architects/module-federation';

@Injectable()
export class ModuleResolver implements ContextResolver {

  constructor() { }

  resolve(ctx: ContextPlugin, data?: any, metadata?: Map<string, any>): Observable<any> {
    console.log('module resolver context', ctx, data, metadata);
    return new Observable<undefined>(obs => {
      loadRemoteModule({
        type: 'module',
        remoteEntry: data.remoteEntry,
        exposedModule: data.exposedModule
      }).then(() => {
        console.log('module resolver loaded', ctx.name);
        obs.next();
        obs.complete();
      });
    });
  }
}
