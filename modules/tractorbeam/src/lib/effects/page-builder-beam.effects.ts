import { loadRemoteModule } from '@angular-architects/module-federation';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { ModuleLoaderService } from '@ng-druid/utils';
import { setPage } from '@ng-druid/panels';
import { Observable, tap } from 'rxjs';

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

  constructor(
    private actions$: Actions,
    private moduleLoaderService: ModuleLoaderService
  ) {
  }
}
