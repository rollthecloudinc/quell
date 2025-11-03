import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ContextPlugin, ContextResolver } from '@rollthecloudinc/context';
import { loadRemoteModule } from '@softarc/native-federation-runtime';
import { ModuleLoaderService } from '@rollthecloudinc/utils';

@Injectable()
export class ModuleResolver implements ContextResolver {

  constructor(
    private moduleLoaderService: ModuleLoaderService
  ) { }

  resolve(ctx: ContextPlugin, data?: any, metadata?: Map<string, any>): Observable<any> {
    console.log('module resolver context', ctx, data, metadata);
    return this.moduleLoaderService.loadModule(
      () => loadRemoteModule({
        //type: 'module',
        remoteEntry: data.remoteEntry,
        remoteName: "plugin",
        exposedModule: data.exposedModule
      }).then(m => m[data.moduleName])
    );
    /*return new Observable<undefined>(obs => {
      loadRemoteModule({
        type: 'module',
        remoteEntry: data.remoteEntry,
        exposedModule: data.exposedModule
      }).then(() => {
        console.log('module resolver loaded', ctx.name);
        obs.next();
        obs.complete();
      });
    });*/
  }
}
