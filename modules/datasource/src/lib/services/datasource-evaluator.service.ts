import { Injectable } from "@angular/core";
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { forkJoin, Observable, of } from "rxjs";
import { defaultIfEmpty, map, switchMap } from "rxjs/operators";
import { Datasource, DatasourcePlugin, Dataset } from "../models/datasource.models";
import { DatasourcePluginManager } from './datasource-plugin-manager.service';

@Injectable({
  providedIn: 'root'
})
export class DatasourceEvaluator {

  constructor(
    private dpm: DatasourcePluginManager,
    private attributeSerializer: AttributeSerializerService
  ) {}

  evalDatasource({ datasource, metadata, datasources }: { datasource: Datasource, metadata: Map<string, any>, datasources?: Map<string, Datasource> }): Observable<Dataset> {
    return of(datasource).pipe(
      switchMap(ds => this.dpm.getPlugin(ds.plugin).pipe(
        map<DatasourcePlugin<string>, [Datasource, DatasourcePlugin<string>]>(p => [ds, p])
      )),
      switchMap(([ds, p]) => p.fetch({ settings: ds.settings, metadata, datasource: ds, datasources }).pipe(
        map<Dataset, [Datasource, Dataset]>(d => [ds, d])
      )),
      switchMap(([ds, dataset]) => 
        forkJoin(
          ds.renderer.bindings.reduce<Array<Observable<Datasource>>>((p, c) => [ ...p, ...(datasources && datasources.has(c.id) ? [ of(datasources.get(c.id)) ] : []) ], [])
        ).pipe(
          switchMap(datasources2 => datasources2.reduce<Observable<Dataset>>((p, c) => p.pipe(
            switchMap<Dataset, Observable<[DatasourcePlugin<string>, Dataset, Datasource]>>(dataset2 => this.dpm.getPlugin(c.plugin).pipe(
              map(dsp => [dsp, dataset2, c ])
            )),
            switchMap(([dsp, dataset2, nestedDatasource]) => dsp.fetch({ settings: c.settings, dataset: dataset2, metadata: metadata, datasource: nestedDatasource, datasources }))
          ), of(dataset))),
          map(dataset => dataset),
          defaultIfEmpty(dataset)
        )
      )
    );
  }

}