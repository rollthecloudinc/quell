import { loadRemoteModule } from '@angular-architects/module-federation';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { PanelPage, setPage, setPageInfo } from '@rollthecloudinc/panels';
import { Observable, switchMap, tap } from 'rxjs';
import { EntityCollectionService, EntityServices } from '@ngrx/data';

@Injectable()
export class PageBuilderBeamEffects {

  setPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPage),
      tap(({ page }) => {
        console.log('tractor beam capture page', page);
        if (page.contexts && Array.isArray(page.contexts)) {
          page.contexts.forEach(c => {
            if (c.plugin === 'module') {
              return this.moduleLoaderService.loadModule(
                () => loadRemoteModule({
                  type: 'module',
                  remoteEntry: c.data.remoteEntry,
                  exposedModule: c.data.exposedModule
                }).then(m => m[c.data.moduleName])
              ).subscribe();
            }
          });
        }
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
        if (pp.contexts && Array.isArray(pp.contexts)) {
          pp.contexts.forEach(c => {
            if (c.plugin === 'module') {
              return this.moduleLoaderService.loadModule(
                () => loadRemoteModule({
                  type: 'module',
                  remoteEntry: c.data.remoteEntry,
                  exposedModule: c.data.exposedModule
                }).then(m => m[c.data.moduleName])
              ).subscribe();
            }
          });
        }
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
