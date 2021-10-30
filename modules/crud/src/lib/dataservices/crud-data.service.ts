import { EntityCollectionDataService, DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator, EntityDefinitionService, EntityDefinition } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { forkJoin, iif, Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { CrudAdaptorPluginManager } from '../services/crud-adaptor-plugin-manager.service';
import { map, switchMap } from "rxjs/operators";
import { CrudEntityConfiguration, CrudEntityMetadata } from "../models/entity-metadata.models";
import { CrudOperations } from '../models/crud.models';
import { Param } from "dparam";
export class CrudDataService<T> extends DefaultDataService<T> implements EntityCollectionDataService<T> {

  constructor(
    entityName: string,
    protected http: HttpClient,
    protected httpUrlGenerator: HttpUrlGenerator,
    protected crud: CrudAdaptorPluginManager,
    protected entityDefinitionService: EntityDefinitionService,
    config?: DefaultDataServiceConfig
  ) {
    super(entityName, http, httpUrlGenerator, config);
  }

  add(object: T): Observable<T> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.evaluatePlugins({ object, plugins: metadata.crud, op: 'create' });
  }
  update(object: Update<T>): Observable<T> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.evaluatePlugins({ object, plugins: metadata.crud, op: 'update' });
  }
  upsert(object: T): Observable<T> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.evaluatePlugins({ object, plugins: metadata.crud, op: 'update' }); // just alias of update for now.
  }

  evaluatePlugins({ object, plugins, op, parentObject }: { object: any, plugins: CrudEntityConfiguration, op: CrudOperations, parentObject?: any }): Observable<T> {
    const adaptors = Object.keys(plugins);
    const operations$ = adaptors.map(
      a => this.crud.getPlugin(a).pipe(
        map(p => ({ p, params: plugins[a].params ? Object.keys(plugins[a].params).reduce((p, name) => ({ ...p, [name]: new Param({ flags: [], mapping: { type: 'static', value: plugins[a].params[name], context: undefined, testValue: plugins[a].params[name] } }) }), {}) : {} })),
        switchMap(({ p, params }) => p[op]({ object, parentObject, params, identity: ({ object, parentObject }) => of({ identity: object.id ? object.id : parentObject ? parentObject.id : undefined }) })),
        switchMap(res => iif(
          () => plugins[a].plugins && Object.keys(plugins[a].plugins).length !== 0,
          plugins[a].plugins && Object.keys(plugins[a].plugins).length !== 0 ? this.evaluatePlugins({ plugins: plugins[a].plugins, object: res.entity ? res.entity : object, parentObject: res.originalEntity ? res.originalEntity : object, op }) : of (res),
          of(res)
        ))
      )
    );
    return forkJoin(operations$).pipe(
      map(() => object)
    );
  }

}