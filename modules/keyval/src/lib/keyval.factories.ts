import { CrudAdaptorPlugin, CrudOperationResponse, CrudOperationInput, CrudCollectionOperationResponse, CrudCollectionOperationInput } from '@rollthecloudinc/crud';
import { Param, ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { concat, forkJoin, Observable, of } from 'rxjs';
import { concatMap, defaultIfEmpty, filter, map, reduce, switchMap, tap } from 'rxjs/operators';
import { set, keys, getMany, setMany } from 'idb-keyval';
import { ConditionProperties, Engine } from 'json-rules-engine';
import { JSONPath } from 'jsonpath-plus';

export const idbEntityCrudAdaptorPluginFactory = (paramsEvaluatorService: ParamEvaluatorService) => {
  return new CrudAdaptorPlugin<string>({
    id: 'idb_keyval',
    title: 'Idb Keyval',
    create: ({ object, identity, params, parentObject }: CrudOperationInput) => of({ success: false }).pipe(
      switchMap(() => identity({ object, parentObject }).pipe(
        map(({ identity }) => ({ identity }))
      )),
      switchMap(({ identity }) => params && Object.keys(params).length !== 0 ? forkJoin(Object.keys(params).map(name => paramsEvaluatorService.paramValue(params[name], new Map<string, any>()).pipe(map(v => ({ [name]: v }))))).pipe(
        map(groups => groups.reduce((p, c) => ({ ...p, ...c }), {})), // default options go here instead of empty object.
        map(options => ({ identity, options }))
      ): of({ identity, options: {} })),
      map(({ identity, options }) => ({ name: options.prefix + identity })),
      switchMap(({ name }) => new Observable<CrudOperationResponse>(obs => {
        set(name, object).then(res => {
          console.log('idb write suceeded');
          console.log(res);
          obs.next({ success: true });
          obs.complete();
        }).catch(e => {
          console.log('idb write failed')
          console.log(e);
          obs.next({ success: false })
          obs.complete();
        });
      }))
    ),
    read: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    update: ({ object, identity, params, parentObject }: CrudOperationInput) => of({ success: false }).pipe(
      switchMap(() => identity({ object, parentObject }).pipe(
        map(({ identity }) => ({ identity }))
      )),
      switchMap(({ identity }) => params && Object.keys(params).length !== 0 ? forkJoin(Object.keys(params).map(name => paramsEvaluatorService.paramValue(params[name], new Map<string, any>()).pipe(map(v => ({ [name]: v }))))).pipe(
        map(groups => groups.reduce((p, c) => ({ ...p, ...c }), {})), // default options go here instead of empty object.
        map(options => ({ identity, options }))
      ): of({ identity, options: {} })),
      map(({ identity, options }) => ({ name: options.prefix + identity })),
      switchMap(({ name }) => new Observable<CrudOperationResponse>(obs => {
        set(name, object).then(res => {
          console.log('idb write suceeded');
          console.log(res);
          obs.next({ success: true });
          obs.complete();
        }).catch(e => {
          console.log('idb write failed')
          console.log(e);
          obs.next({ success: false })
          obs.complete();
        });
      }))
    ),
    delete: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    // query: ({}: CrudCollectionOperationInput) => of<CrudCollectionOperationResponse>({ success: false, entities: [] })
    query: ({ params, rule, identity }: CrudCollectionOperationInput) => paramsEvaluatorService.paramValues(new Map<string, Param>(Object.keys(params).map(name => [name, params[name]]))).pipe(
      switchMap(options => new Observable<CrudCollectionOperationResponse>(obs => {
        keys()
        .then(keys => keys.filter(k => `${k}`.indexOf(options.get('prefix')) === 0))
        .then(keys => getMany(keys))
        .then(entities => {
          obs.next({ entities, success: true });
          obs.complete();
        })
      })),
      switchMap(out => !rule ? of(out) : new Observable<CrudCollectionOperationResponse>(obs => {
        const engine = new Engine();
        // This should not be here should be setup for default engine but for now whatever.
        engine.addOperator('startsWith', (fv, jv) => typeof(jv) === 'string' && typeof(fv) === 'string' && jv.indexOf(fv) === 0);
        engine.addOperator('term||wildcard', (fv: string, jv: string) => {
          const jsonValue = JSON.parse(decodeURIComponent(jv));
          const terms = JSONPath({ path: `$.term.*.value.@string()`, json: jsonValue, flatten: true });
          return jsonValue.wildcard !== undefined || (jsonValue.term && terms.lengh !== 0 && terms[0] === fv);
        });
        engine.addRule(rule);
        engine.addFact('identity', (_, almanac) => new Observable(obs2 => {
          almanac.factValue('entity')
          .then(object => identity({ object }).pipe(map(({ identity }) => identity)).toPromise())
          .then(id => {
            obs2.next(id);
            obs2.complete();
          })
        }).toPromise(), { cache: false });
        of(...out.entities).pipe(
          concatMap(entity => new Observable<[any, boolean]>(obs2 => {
            engine.removeFact('entity');
            engine.addFact('entity', entity, { cache: false });
            engine.run().then(res => {
              obs2.next([entity, res.events.findIndex(e => e.type === 'visible') > -1]);
              obs2.complete();
            });
          })),
          filter(([ _, matched ]) => matched),
          map(([entity]) => entity),
          reduce((acc, v) => [ ...acc, v ] , []),
          defaultIfEmpty([])
        ).subscribe(entities => {
          obs.next({ ...out, entities });
          obs.complete();
        });
      }))
    )
  });
};

export const initializeIdbDataFactory = ({ data, key }: { data: Array<any>, key: ({ data: any }) => IDBValidKey }) => (): () => Observable<any> => {
  return () => new Observable(obs => {
    const items: Array<[IDBValidKey, any]> = data.map(d => [key({ data: d }), d]);
    setMany(items).then(() => {
      console.log('data loaded into idb');
      obs.next();
      obs.complete();
    }).catch(() => {
      console.log('data load into idb failure');
      obs.next();
      obs.complete();
    })
  });
 };