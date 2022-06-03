import { EntityCollectionDataService, DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator, EntityDefinitionService, EntityDefinition, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { forkJoin, iif, Observable, of } from "rxjs";
import { CrudAdaptorPluginManager } from '../services/crud-adaptor-plugin-manager.service';
import { map, switchMap } from "rxjs/operators";
import { CrudEntityConfiguration, CrudEntityMetadata } from "../models/entity-metadata.models";
import { CrudOperations, CrudOperationResponse, CrudCollectionOperationResponse } from '../models/crud.models';
import { Param } from '@rollthecloudinc/dparam';
import { NestedCondition, Rule } from "json-rules-engine";
import { CrudDataHelperService } from "../services/crud-data-helper.service";
// import * as qs from 'qs';
export class CrudDataService<T> implements EntityCollectionDataService<T> {

  protected _name: string;
  protected entityName: string;

  get name() {
    return this._name;
  }

  constructor(
    entityName: string,
    protected crud: CrudAdaptorPluginManager,
    protected entityDefinitionService: EntityDefinitionService,
    protected crudDataHelperService: CrudDataHelperService
  ) {
    this._name = `${entityName} CrudDataService`;
    this.entityName = entityName;
  }

  add(object: T): Observable<T> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.crudDataHelperService.evaluatePlugins({ object, plugins: metadata.crud, op: 'create' });
  }
  update(update: Update<T>): Observable<T> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.crudDataHelperService.evaluatePlugins({ object: update.changes, plugins: metadata.crud, op: 'update' });
  }
  upsert(object: T): Observable<T> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.crudDataHelperService.evaluatePlugins({ object, plugins: metadata.crud, op: 'update' }); // just alias of update for now.
  }
  delete(id: number | string): Observable<number | string> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.getById(id).pipe(
      switchMap(object => this.crudDataHelperService.evaluatePlugins({ object, plugins: metadata.crud, op: 'delete' })),
      map(() => id)
    );
  }

  getAll(): Observable<Array<T>> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.crudDataHelperService.evaluateCollectionPlugins<T>({ plugins: metadata.crud, op: 'query' });
  }

  getById(id: any): Observable<T> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.crudDataHelperService.evaluateCollectionPlugins<T>({ query: `identity=${id}`, plugins: metadata.crud, op: 'query' }).pipe(
      map(objects => objects && objects.length !== 0 ? objects[0] : undefined)
    );
  }
  getWithQuery(params: QueryParams | string): Observable<Array<T>> {
    // @todo: convert to rules. - eq support possibly nesting... - _root. -- where root will be the item/object
    /*const flat: Array<T> = [];
    this.entities.forEach(v => {
      flat.push(v);
    });
    return of(flat);*/
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.crudDataHelperService.evaluateCollectionPlugins({ query: params, plugins: metadata.crud, op: 'query' });
  }

}