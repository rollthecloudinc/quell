import { Injectable } from '@angular/core';
import { ContextResolver } from '../models/context.models';
import { Observable, of } from 'rxjs';
import { ContextPlugin } from '../models/context.models';
import { Dataset, Datasource, DatasourcePluginManager } from '@rollthecloudinc/datasource';
import { defaultIfEmpty, map, switchMap, take } from 'rxjs/operators';
import { StoreRouterConnectingModule } from '@ngrx/router-store';

@Injectable()
export class DatasourceResolver implements ContextResolver {

  constructor(private dpm: DatasourcePluginManager) { }

  resolve(ctx: ContextPlugin, data?: any, metadata?: Map<string, any>): Observable<any> {
    /**
     * @todo: When context bindings change fetch again.
     */
    return of(new Dataset()).pipe(
      map(() => new Datasource(data)),
      switchMap(ds => this.dpm.getPlugin(ds.plugin).pipe(
        map(p => ({ ds, p }))
      )),
      switchMap(({ ds, p }) => p.fetch({ settings: ds.settings, metadata })),
      map(d => d)
    );
  }
}
