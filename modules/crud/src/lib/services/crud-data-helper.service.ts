import { Injectable } from "@angular/core";
import { QueryParams } from "@ngrx/data";
import { concat, forkJoin, iif, Observable, of, ReplaySubject, Subject, throwError } from "rxjs";
import { CrudAdaptorPluginManager } from '../services/crud-adaptor-plugin-manager.service';
import { defaultIfEmpty, filter, map, switchMap, take, tap, concatMap, finalize } from "rxjs/operators";
import { CrudEntityConfiguration, CrudEntityConfigurationPlugin } from "../models/entity-metadata.models";
import { CrudOperations, CrudOperationResponse, CrudCollectionOperationResponse, CrudAdaptorPlugin, CrudCollectionOperationInput } from '../models/crud.models';
import { Param } from '@rollthecloudinc/dparam';
import { NestedCondition, Rule } from "json-rules-engine";
import { getDiff } from 'recursive-diff';

@Injectable({
  providedIn: 'root'
})
export class CrudDataHelperService {

  private cachedCollectionQueries: Array<{ p: CrudAdaptorPlugin<string>, input: CrudCollectionOperationInput, query$: ReplaySubject<CrudCollectionOperationResponse> }> = [];
  private readonly cachedCollectionIgnore = { p: { create: undefined, update: undefined, delete: undefined, query: undefined, read: undefined }, input: { identity: undefined } };

  constructor(
    protected crud: CrudAdaptorPluginManager
  ) {
  }

  evaluatePlugins<T>({ object, plugins, op, parentObject }: { object: any, plugins: CrudEntityConfiguration, op: CrudOperations, parentObject?: any }): Observable<T> {
    const adaptors = Object.keys(plugins);
    const operations$ = adaptors.filter(a => !plugins[a].ops || plugins[a].ops.includes(op)).map(
      a => this.crud.getPlugin(plugins[a].plugin ? plugins[a].plugin : a).pipe(
        map(p => ({ p, params: plugins[a].params ? Object.keys(plugins[a].params).reduce((p, name) => ({ ...p, [name]: plugins[a].params[name] instanceof Param ? plugins[a].params[name] : new Param({ flags: [], mapping: { type: 'static', value: plugins[a].params[name], context: undefined, testValue: plugins[a].params[name] } }) }), {}) : {} })),
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

  evaluateCollectionPlugins<T>({ query, objects, plugins, op, parentObjects }: { query?: QueryParams | string, objects?: Iterable<any>, plugins: CrudEntityConfiguration, op: CrudOperations, parentObjects?: Iterable<any> }): Observable<Array<T>> {
    console.log('evaluate collection plugins');
    const adaptors = Object.keys(plugins);
    const operations$ = adaptors.filter(a => !plugins[a].ops || plugins[a].ops.includes(op)).map(
      a => this.crud.getPlugin(plugins[a].plugin ? plugins[a].plugin : a).pipe(
        map(p => ({ p, params: plugins[a].params ? Object.keys(plugins[a].params).reduce((p, name) => ({ ...p, [name]: plugins[a].params[name] instanceof Param ? plugins[a].params[name] : new Param({ flags: [], mapping: { type: 'static', value: plugins[a].params[name], context: undefined, testValue: plugins[a].params[name] } }) }), {}) : {} })),
        switchMap(({ p, params }) => this.buildQueryRule({ params: query, config: plugins[a] }).pipe(
          map(({ rule }) => ({ p, params, rule }))
        )),
        // tap(({ params, rule }) => console.log('right before collection plugin query', params, rule)),
        // switchMap(({ p, params, rule }) => p.query({ rule, objects, parentObjects, params, identity: ({ object, parentObject }) => of({ identity: object.id ? object.id : parentObject ? parentObject.id : undefined }) }).pipe(
          switchMap(({ p, params, rule }) => this.flightAndCacheAwareCollectionQuery<T>({ p, input: { rule, objects, parentObjects, params, identity: ({ object, parentObject }) => of({ identity: object.id ? object.id : parentObject ? parentObject.id : undefined }) } }).pipe(
          tap(() => console.log('end of crud query call'))
        )),
        // tap(res => console.log('right before nested collection plugins', res)),
        switchMap(res => iif(
          () => plugins[a].plugins && Object.keys(plugins[a].plugins).length !== 0,
          this.evaluateCollectionPlugins({ query, plugins: plugins[a].plugins && Object.keys(plugins[a].plugins).length !== 0 ? plugins[a].plugins : {}, objects: res.entities ? res.entities : objects, parentObjects: res.originalEntities ? res.originalEntities : objects, op }),
          of(res)
        )),
        tap(res => console.log('end of op', res))
      ),
    );
    const fallback = adaptors.filter(a => !plugins[a].ops || plugins[a].ops.includes(op)).find(a => plugins[a].fallback);
    if (fallback && operations$.length > 1) {
      return operations$.reduce((p, c) => p.pipe(
        switchMap(entities => entities && Array.isArray(entities) && entities.length > 0 ? of(entities) : c.pipe(
          map(c => c && (c as any).entities && Array.isArray((c as any).entities) ? (c as any).entities : []),
        )),
        switchMap(entities => entities.length > 0 ? of(entities) : of([]))
      ), of([]));
    } else {
      return operations$.length === 1 ? operations$[0].pipe(map<CrudCollectionOperationResponse, Array<T>>(c => [ ...c.entities ])) : forkJoin(operations$).pipe(
        map<Array<CrudCollectionOperationResponse>, Array<T>>(responses => responses.reduce((p, c) => [ ...p, ...c.entities ], [])),
        defaultIfEmpty([])
      );
    }
  }

  buildQueryRule({ params, config }: { params: QueryParams | string, config: CrudEntityConfigurationPlugin }): Observable<{ rule: Rule }> {
    return new Observable<{ rule: Rule }>(obs => {
      // const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
      const conditions: Array<NestedCondition> = [];
      // KISS for now - use qs later - move to reusable function probably inside durl. First lets proof it out with one level.
      if (typeof(params) === 'string') {
        const pieces = params.split('&').map(p => p.split('=', 2)).reduce((p, [name, value]) => new Map<string, Array<any>>([ ...Array.from(p).filter(([k, _]) => k !== name) ,[ name, [ ...(p.has(name) ? p.get(name) : []), value ] ] ]), new Map<string, Array<any>>());
        pieces.forEach((values, name) => 
          conditions.push({ 
            any: values.map(value => ({ fact: name === 'identity' ? 'identity' : 'entity', operator: config.queryMappings && config.queryMappings.has(name) && config.queryMappings.get(name).defaultOperator ? config.queryMappings.get(name).defaultOperator : 'equal', value, ...(name === 'identity' ? {} : { path: `$.${name}` }) }))
           })
        );
      }
      const rule = conditions.length > 0 ? new Rule({ conditions: { all: conditions }, event: { type: 'visible' } }) : undefined;
      obs.next({ rule });
      obs.complete();
    });
  }

  flightAndCacheAwareCollectionQuery<T>(q: { p: CrudAdaptorPlugin<string>, input: CrudCollectionOperationInput }): Observable<CrudCollectionOperationResponse> {
    // console.log('flightAndCacheAwareCollectionQuery', q.p, q.input);
    let matchedIndex = this.cachedCollectionQueries.findIndex(({ p, input }) => {
      const pDiff = getDiff({ ...q.p, ...this.cachedCollectionIgnore.p }, { ...p, ...this.cachedCollectionIgnore.p });
      const iDiff = getDiff({ ...q.input, ...this.cachedCollectionIgnore.input }, { ...input, ...this.cachedCollectionIgnore.input });
      // console.log('pDiff', pDiff);
      // console.log('iDiff', iDiff);
      return pDiff.length === 0 && iDiff.length === 0;
    });
    if (matchedIndex === -1) {
      this.cachedCollectionQueries.push({ p: q.p, input: q.input, query$: new ReplaySubject<CrudCollectionOperationResponse>() });
      matchedIndex = this.cachedCollectionQueries.length - 1;
      q.p.query(q.input).pipe(
        tap(res => this.cachedCollectionQueries[matchedIndex].query$.next(res)),
        take(1)
      ).subscribe();
    }
    return this.cachedCollectionQueries[matchedIndex].query$.pipe(
      take(1)
    );
  }

}