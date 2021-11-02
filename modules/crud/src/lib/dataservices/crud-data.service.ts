import { EntityCollectionDataService, DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator, EntityDefinitionService, EntityDefinition, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { forkJoin, iif, Observable, of } from "rxjs";
import { CrudAdaptorPluginManager } from '../services/crud-adaptor-plugin-manager.service';
import { map, switchMap } from "rxjs/operators";
import { CrudEntityConfiguration, CrudEntityMetadata } from "../models/entity-metadata.models";
import { CrudOperations, CrudOperationResponse, CrudCollectionOperationResponse } from '../models/crud.models';
import { Param } from "dparam";
import { NestedCondition, Rule } from "json-rules-engine";
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
    protected entityDefinitionService: EntityDefinitionService
  ) {
    this._name = `${entityName} CrudDataService`;
    this.entityName = entityName;
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
  delete(id: number | string): Observable<number | string> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.getById(id).pipe(
      switchMap(object => this.evaluatePlugins({ object, plugins: metadata.crud, op: 'delete' })),
      map(() => id)
    );
  }

  getAll(): Observable<Array<T>> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.evaluateCollectionPlugins({ plugins: metadata.crud, op: 'query' });
  }

  getById(id: any): Observable<T> {
    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    return this.evaluateCollectionPlugins({ query: `identity=${id}`, plugins: metadata.crud, op: 'query' }).pipe(
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
    return this.evaluateCollectionPlugins({ query: params, plugins: metadata.crud, op: 'query' });
  }

  evaluatePlugins({ object, plugins, op, parentObject }: { object: any, plugins: CrudEntityConfiguration, op: CrudOperations, parentObject?: any }): Observable<T> {
    const adaptors = Object.keys(plugins);
    const operations$ = adaptors.map(
      a => this.crud.getPlugin(a).pipe(
        map(p => ({ p, params: plugins[a].params ? Object.keys(plugins[a].params).reduce((p, name) => ({ ...p, [name]: new Param({ flags: [], mapping: { type: 'static', value: plugins[a].params[name], context: undefined, testValue: plugins[a].params[name] } }) }), {}) : {} })),
        switchMap(({ p, params }) => p[op]({ rule: undefined, object, parentObject, params, identity: ({ object, parentObject }) => of({ identity: object.id ? object.id : parentObject ? parentObject.id : undefined }) })),
        switchMap<CrudOperationResponse, Observable<CrudOperationResponse>>(res => iif<CrudOperationResponse, CrudOperationResponse>(
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

  evaluateCollectionPlugins({ query, objects, plugins, op, parentObjects }: { query?: QueryParams | string, objects?: Iterable<any>, plugins: CrudEntityConfiguration, op: CrudOperations, parentObjects?: Iterable<any> }): Observable<Array<T>> {
    const adaptors = Object.keys(plugins);
    const operations$ = adaptors.map(
      a => this.crud.getPlugin(a).pipe(
        map(p => ({ p, params: plugins[a].params ? Object.keys(plugins[a].params).reduce((p, name) => ({ ...p, [name]: new Param({ flags: [], mapping: { type: 'static', value: plugins[a].params[name], context: undefined, testValue: plugins[a].params[name] } }) }), {}) : {} })),
        switchMap(({ p, params }) => this.buildQueryRule({ params: query, plugin: a }).pipe(
          map(({ rule }) => ({ p, params, rule }))
        )),
        switchMap(({ p, params, rule }) => p.query({ rule, objects, parentObjects, params, identity: ({ object, parentObject }) => of({ identity: object.id ? object.id : parentObject ? parentObject.id : undefined }) })),
        switchMap(res => iif(
          () => plugins[a].plugins && Object.keys(plugins[a].plugins).length !== 0,
          plugins[a].plugins && Object.keys(plugins[a].plugins).length !== 0 ? this.evaluateCollectionPlugins({ query, plugins: plugins[a].plugins, objects: res.entities ? res.entities : objects, parentObjects: res.originalEntities ? res.originalEntities : objects, op }) : of (res),
          of(res)
        ))
      )
    );
    return forkJoin(operations$).pipe(
      map<Array<CrudCollectionOperationResponse>, Array<T>>(responses => responses.reduce((p, c) => [ ...p, ...c.entities ], []))
    );
  }

  buildQueryRule({ params, plugin }: { params: QueryParams | string, plugin: string }): Observable<{ rule: Rule }> {
    return new Observable<{ rule: Rule }>(obs => {
      const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
      const conditions: Array<NestedCondition> = [];
      // KISS for now - use qs later - move to reusable function probably inside durl. First lets proof it out with one level.
      if (typeof(params) === 'string') {
        const pieces = params.split('&').map(p => p.split('=', 2)).reduce((p, [name, value]) => new Map<string, Array<any>>([ ...Array.from(p).filter(([k, _]) => k !== name) ,[ name, [ ...(p.has(name) ? p.get(name) : []), value ] ] ]), new Map<string, Array<any>>());
        pieces.forEach((values, name) => 
          conditions.push({ 
            any: values.map(value => ({ fact: name === 'identity' ? 'identity' : 'entity', operator: metadata.crud && metadata.crud[plugin] && metadata.crud[plugin].queryMappings && metadata.crud[plugin].queryMappings && metadata.crud[plugin].queryMappings.has(name) && metadata.crud[plugin].queryMappings.get(name).defaultOperator ? metadata.crud[plugin].queryMappings.get(name).defaultOperator : 'equal', value, ...(name === 'identity' ? {} : { path: `$.${name}` }) }))
           })
        );
      }
      const rule = conditions.length > 0 ? new Rule({ conditions: { all: conditions }, event: { type: 'visible' } }) : undefined;
      obs.next({ rule });
      obs.complete();
    });
  }

}