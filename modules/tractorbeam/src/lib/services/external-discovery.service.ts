import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { defaultIfEmpty, delay, map, switchMap, take, tap } from 'rxjs/operators';
import { ModuleLoaderService } from '@ng-druid/utils';
import { PluginDiscovery } from '@ng-druid/plugin';
import { EntityServices } from '@ngrx/data';
import { PageBuilderFacade } from '@ng-druid/panels';
import { loadRemoteModule } from '@angular-architects/module-federation';

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
      switchMap(info => this.es.getEntityCollectionService('PanelPage').getByKey(info.id).pipe(
        defaultIfEmpty(undefined)
      )),
      switchMap(pp => pp ? forkJoin(
          pp.contexts.filter(c => c.plugin === 'module').map(c => 
            this.moduleLoader.loadModule(
              () => loadRemoteModule({
                type: 'module',
                remoteEntry: c.data.remoteEntry,
                exposedModule: c.data.exposedModule
              }).then(m => m.DownloadModule)
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
