import { CrudAdaptorPlugin, CrudOperationResponse, CrudOperationInput, CrudCollectionOperationResponse, CrudCollectionOperationInput } from '@rollthecloudinc/crud';
import { Param, ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { Observable, of, from } from 'rxjs';
import { switchMap, map, reduce, defaultIfEmpty, filter, catchError } from 'rxjs/operators';
// REMOVED: import { set, keys, getMany, setMany } from 'idb-keyval'; <-- THIS CAUSED THE SSR ERROR
import * as jre from "json-rules-engine";
import * as jpp from 'jsonpath-plus';
import { isPlatformBrowser } from '@angular/common';

// Helper to safely load idb-keyval only in the browser
const getKeyvalFunctions = async (platformId: Object) => {
  if (isPlatformBrowser(platformId)) {
    // Dynamic import to load the dependency only on the client
    return await import('idb-keyval');
  }
  // Return a no-op implementation for the server
  return {
    set: () => Promise.resolve(undefined),
    keys: () => Promise.resolve([] as IDBValidKey[]),
    getMany: () => Promise.resolve([] as any[]),
    setMany: () => Promise.resolve(undefined),
  };
};

// Updated factory signature to accept platformId
export const idbEntityCrudAdaptorPluginFactory = (
  paramsEvaluatorService: ParamEvaluatorService,
  platformId: Object // Platform ID is now accepted here
) => {
  return new CrudAdaptorPlugin<string>({
    id: 'idb_keyval',
    title: 'Idb Keyval',
    create: ({ object, identity, params, parentObject }: CrudOperationInput) => of({ success: false }).pipe(
      switchMap(() => identity({ object, parentObject }).pipe(
        map(({ identity }) => ({ identity }))
      )),
      switchMap(({ identity }) => params && Object.keys(params).length !== 0 ? paramsEvaluatorService.paramValues(new Map<string, Param>(Object.entries(params))).pipe(
        map(optionsMap => Array.from(optionsMap.entries()).reduce((p, [k, v]) => ({ ...p, [k]: v }), {})),
        map(options => ({ identity, options }))
      ) : of({ identity, options: {} })),
      map(({ identity, options }) => ({ name: (options as { prefix: string }).prefix + identity, object })),
      
      // Dynamic import and execution wrapped in a switchMap
      switchMap(({ name, object }) => from(getKeyvalFunctions(platformId)).pipe(
        switchMap(({ set }) => new Observable<CrudOperationResponse>(obs => {
          set(name, object).then(res => {
            console.log('idb write succeeded');
            console.log(res);
            obs.next({ success: true });
            obs.complete();
          }).catch(e => {
            console.log('idb write failed');
            console.log(e);
            obs.next({ success: false /*, error: e.message */})
            obs.complete();
          });
        }))
      )),
      catchError(error => {
        console.error('Error in create stream:', error);
        return of({ success: false, error: error.message });
      })
    ),
    read: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    
    update: ({ object, identity, params, parentObject }: CrudOperationInput) => of({ success: false }).pipe(
      switchMap(() => identity({ object, parentObject }).pipe(
        map(({ identity }) => ({ identity }))
      )),
      switchMap(({ identity }) => params && Object.keys(params).length !== 0 ? paramsEvaluatorService.paramValues(new Map<string, Param>(Object.entries(params))).pipe(
        map(optionsMap => Array.from(optionsMap.entries()).reduce((p, [k, v]) => ({ ...p, [k]: v }), {})),
        map(options => ({ identity, options }))
      ) : of({ identity, options: {} })),
      map(({ identity, options }) => ({ name: (options as { prefix: string }).prefix + identity, object })),
      
      // Dynamic import and execution wrapped in a switchMap
      switchMap(({ name, object }) => from(getKeyvalFunctions(platformId)).pipe(
        switchMap(({ set }) => new Observable<CrudOperationResponse>(obs => {
          set(name, object).then(res => {
            console.log('idb write succeeded');
            console.log(res);
            obs.next({ success: true });
            obs.complete();
          }).catch(e => {
            console.log('idb write failed');
            console.log(e);
            obs.next({ success: false /*, error: e.message*/ })
            obs.complete();
          });
        }))
      )),
      catchError(error => {
        console.error('Error in update stream:', error);
        return of({ success: false, error: error.message });
      })
    ),
    
    delete: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    
    query: ({ params, rule, identity }: CrudCollectionOperationInput) => paramsEvaluatorService.paramValues(new Map<string, Param>(Object.keys(params).map(name => [name, params[name]]))).pipe(
      
      // Dynamic import and execution wrapped in a switchMap
      switchMap(options => from(getKeyvalFunctions(platformId)).pipe(
        switchMap(({ keys, getMany }) => new Observable<CrudCollectionOperationResponse>(obs => {
          keys()
            .then(keys => keys.filter(k => `${k}`.indexOf(options.get('prefix') as string) === 0))
            .then(keys => getMany(keys))
            .then(entities => {
              obs.next({ entities, success: true });
              obs.complete();
            })
            .catch(e => {
                console.error('idb query failed:', e);
                obs.next({ entities: [], success: false /*, error: e.message*/ });
                obs.complete();
            });
        }))
      )),
      
      switchMap(out => !rule ? of(out) : new Observable<CrudCollectionOperationResponse>(obs => {
        const engine = new jre.Engine();
        // This should not be here should be setup for default engine but for now whatever.
        engine.addOperator('startsWith', (fv, jv) => typeof(jv) === 'string' && typeof(fv) === 'string' && jv.indexOf(fv) === 0);
        engine.addOperator('term||wildcard', (fv: string, jv: string) => {
          const jsonValue = JSON.parse(decodeURIComponent(jv));
          const terms = jpp.JSONPath({ path: `$.term.*.value.@string()`, json: jsonValue, flatten: true });
          return jsonValue.wildcard !== undefined || (jsonValue.term && terms.length !== 0 && terms[0] === fv);
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
        
        from(out.entities).pipe(
          switchMap(entity => new Observable<[any, boolean]>(obs2 => {
            engine.removeFact('entity');
            engine.addFact('entity', entity, { cache: false });
            engine.run().then(res => {
              obs2.next([entity, res.events.findIndex(e => e.type === 'visible') > -1]);
              obs2.complete();
            });
          })),
          filter(([ _, matched ]) => matched),
          map(([entity]) => entity),
          reduce((acc, v) => [ ...acc, v ] , [] as any[]),
          defaultIfEmpty([])
        ).subscribe(entities => {
          obs.next({ ...out, entities });
          obs.complete();
        });
      }))
    )
  });
};

// Updated initializeIdbDataFactory to use Dynamic Import and return an Observable
export const initializeIdbDataFactory = ({ data, key }: { data: Array<any>, key: ({ data }: { data: any }) => IDBValidKey }) => (platformId: Object): () => Observable<any> => {
  // This returned function is the initializer
  return () => { 
    if (!isPlatformBrowser(platformId)) {
      // Return a completed Observable immediately on the server
      return of(null).pipe(map(() => { 
        console.log('Skipping IDB data initialization during SSR.');
        return null; 
      }));
    }
    
    // On the browser, dynamically import the library
    return from(import('idb-keyval')).pipe(
      switchMap(({ setMany }) => new Observable(obs => {
        const items: Array<[IDBValidKey, any]> = data.map(d => [key({ data: d }), d]);
        setMany(items).then(() => {
          console.log('data loaded into idb');
          obs.next(null);
          obs.complete();
        }).catch((e) => {
          console.log('data load into idb failure:', e);
          obs.next(null);
          obs.complete();
        });
      }))
    );
  };
};