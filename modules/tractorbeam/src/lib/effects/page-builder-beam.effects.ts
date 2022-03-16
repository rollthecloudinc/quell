import { loadRemoteModule } from '@angular-architects/module-federation';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { ModuleLoaderService } from '@ng-druid/utils';
import { PanelPage, setPage, setPageInfo } from '@ng-druid/panels';
import { Observable, switchMap, tap } from 'rxjs';
import { EntityCollectionService, EntityServices } from '@ngrx/data';

@Injectable()
export class PageBuilderBeamEffects {

  setPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPage),
      tap(({ page }) => {
        console.log('tractor beam capture page', page);
        page.contexts.forEach(c => {
          if (c.plugin === 'module') {
            /*new Observable<undefined>(obs => {
              loadRemoteModule({
                type: 'module',
                remoteEntry: c.data.remoteEntry,
                exposedModule: c.data.exposedModule
              }).then(() => {
                console.log('tractor loaded', c.name);
                obs.next();
                obs.complete();
              });
            }).subscribe();*/
            return this.moduleLoaderService.loadModule(
              () => loadRemoteModule({
                type: 'module',
                remoteEntry: c.data.remoteEntry,
                exposedModule: c.data.exposedModule
              }).then(m => m.DownloadModule)
            ).subscribe();
          }
        });
      })
    ),
    { dispatch: false }
  );

  setPageInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPageInfo),
      tap(({ info }) => {
        console.log('tractor beam info', info);
      }),
      switchMap(({ info }) => this.es.getEntityCollectionService('PanelPage').getByKey(info.id)),
      tap(pp => {
        pp.contexts.forEach(c => {
          if (c.plugin === 'module') {
            return this.moduleLoaderService.loadModule(
              () => loadRemoteModule({
                type: 'module',
                remoteEntry: c.data.remoteEntry,
                exposedModule: c.data.exposedModule
              }).then(m => m.DownloadModule)
            ).subscribe();
          }
        });
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private moduleLoaderService: ModuleLoaderService,
    private es: EntityServices
  ) {
  }
}
