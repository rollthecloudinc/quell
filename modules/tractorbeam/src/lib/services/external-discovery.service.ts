import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { defaultIfEmpty, delay, map, switchMap, take, tap } from 'rxjs/operators';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { PluginDiscovery } from '@rollthecloudinc/plugin';
import { EntityServices } from '@ngrx/data';
import { PageBuilderFacade } from '@rollthecloudinc/panels';
import { loadRemoteModule } from '@softarc/native-federation-runtime';

@Injectable({
  providedIn: 'root'
})
export class ExternalDiscovery implements PluginDiscovery  {
  constructor(
    private moduleLoader: ModuleLoaderService,
    private pageBuilderFacade: PageBuilderFacade,
    private es: EntityServices
  ) {
  }
  loadPlugins(): Observable<boolean> {
    return this.pageBuilderFacade.getPageInfo$.pipe(
      tap(() => console.log('started loading external modules')),
      switchMap(info => (info && info.id ? this.es.getEntityCollectionService('PanelPage').getByKey(info.id) : of(undefined)).pipe(
        defaultIfEmpty(undefined)
      )),
      switchMap(pp => pp ? forkJoin(
          pp.contexts.filter(c => c.plugin === 'module').map(c => 
            this.moduleLoader.loadModule(
              () => loadRemoteModule({
                //type: 'module',
                remoteEntry: c.data.remoteEntry,
                remoteName: "plugin",
                exposedModule: c.data.exposedModule
              }).then(m => m[c.data.moduleName])
            )
          )
        ).pipe(
          delay(1),
          defaultIfEmpty([])
        ) 
        : of([])
      ),
      tap(() => console.log('completed loading external modules')),
      map(() => true),
      take(1)
    );
  }
}
