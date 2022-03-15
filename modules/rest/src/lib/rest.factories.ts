import { AttributeValue } from '@ng-druid/attributes';
import { Dataset, DatasourcePlugin, DatasourceEditorOptions, Datasource, Rest } from '@ng-druid/datasource';
import { iif, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, switchMap, timeout } from 'rxjs/operators';
import { RestDatasourceComponent } from './components/rest-datasource/rest-datasource.component';
import { AttributeSerializerService } from '@ng-druid/attributes';
import { RestFetchHelperService } from './services/rest-fetch-helper.service';
import { ContentBinding } from '@ng-druid/content';
import { ParamContextExtractorService } from '@ng-druid/context';
import { CrudAdaptorPlugin, CrudCollectionOperationInput, CrudCollectionOperationResponse, CrudOperationInput, CrudOperationResponse } from '@ng-druid/crud';
import { Param, ParamEvaluatorService } from '@ng-druid/dparam';
import { DefaultDataServiceConfig, HttpMethods, HttpUrlGenerator, RequestData } from '@ngrx/data';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AllConditions, AnyConditions, ConditionProperties, NestedCondition } from 'json-rules-engine';

export const restDatasourcePluginFactory = (
  fetchhelper: RestFetchHelperService,
  paramContextExtractor: ParamContextExtractorService,
  attributeSerializer: AttributeSerializerService
) => {
  return new DatasourcePlugin<string>({ 
    id: 'rest', 
    title: 'Rest', 
    editor: RestDatasourceComponent,
    fetch: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata: Map<string, any> }) => fetchhelper.fetchDataset({ settings, metadata }),
    editorOptions: () => of(new DatasourceEditorOptions({ fullscreen: true })),
    getBindings: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata?: Map<string, any> }) => of([]).pipe(
      map(() => attributeSerializer.deserializeAsObject(settings)),
      map<any, Rest>(s => new Rest(s)),
      switchMap(ds => paramContextExtractor.extractContexts(ds.params)),
      map(contexts => contexts.map(id => new ContentBinding({ id, type: 'context' })))
    )
  });
};

export const restEntityCrudAdaptorPluginFactory = (paramsEvaluatorService: ParamEvaluatorService, http: HttpClient, httpUrlGenerator: HttpUrlGenerator, config: DefaultDataServiceConfig) => {
  return new CrudAdaptorPlugin<string>({
    id: 'rest',
    title: 'Rest',
    create: ({ object, params }: CrudOperationInput) => of({ success: false }).pipe(
      switchMap(() => paramsEvaluatorService.paramValues(new Map<string, Param>(Object.keys(params).map(name => [name, params[name]])))),
      switchMap(options => restfulRequest({ method: 'POST', url: httpUrlGenerator.entityResource(options.get('entityName'), options.has('root') ? options.get('root') : config.root ? config.root : 'api'), data: object || new Error(`No entity to add`) , params: options, http })),
      map(() => ({ success: true, entity: object }))
    ),
    read: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    update: ({ object, identity, params, parentObject }: CrudOperationInput) => of({ success: false }).pipe(
      switchMap(() => identity({ object, parentObject })),
      switchMap(({ identity }) => paramsEvaluatorService.paramValues(new Map<string, Param>(Object.keys(params).map(name => [name, params[name]]))).pipe(
        map(options => ({ identity, options }))
      )),
      switchMap(({ identity, options }) => restfulRequest({ method: 'PUT', url: httpUrlGenerator.entityResource(options.get('entityName'), options.has('root') ? options.get('root') : config.root ? config.root : 'api') + `${identity}`, data: object || new Error(`No entity to add`) , params: options, http })),
      map(() => ({ success: true, entity: object }))
    ),
    delete: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    query: ({ params, rule }: CrudCollectionOperationInput) => of({ success: false }).pipe(
      switchMap(() => paramsEvaluatorService.paramValues(new Map<string, Param>(Object.keys(params).map(name => [name, params[name]])))),
      switchMap(options => new Observable(obs => {
        const query = rule ? (rule.conditions as AllConditions).all.reduce<Array<string>>((p, c) => [ ...p, ...(c as AnyConditions).any.filter(c2 => (c2 as ConditionProperties).fact !== 'identity').map(c2 => `${(c2 as ConditionProperties).path.substr(2)}=${(c2 as ConditionProperties).value}`) ], []) : [];
        const identityFact = rule ? (rule.conditions as AllConditions).all.reduce((p, c) => !p ? (c as AnyConditions).any.find(c2 => (c2 as ConditionProperties).fact === 'identity') : p, undefined) : undefined;
        obs.next({ identityFact, options, query: query.length > 0 ? new HttpParams({ fromString: query.join('&') }) : undefined, path: identityFact ? (identityFact as ConditionProperties).value : ''});
        obs.complete();
      })),
      switchMap(({ options, query, path, identityFact }) => iif(
        () => !!identityFact,
        restfulRequest({ method: 'GET', url: httpUrlGenerator.entityResource(options.get('entityName'), options.has('root') ? options.get('root') : config.root ? config.root : 'api') + path, options: { params: query }, params: options, http }).pipe(
          map(objects => ({ success: true, entities: Array.isArray(objects) ? objects : [ objects ] }))
        ),
        restfulRequest({ method: 'GET', url: httpUrlGenerator.collectionResource(options.get('entityName'), options.has('root') ? options.get('root') : config.root ? config.root : 'api') + path, options: { params: query }, params: options, http }).pipe(
          map(objects => ({ success: true, entities: objects }))
        )
      )),
    ),
  });
};

export const restfulRequest = ({ method, url, data, options, params, http }: { method: HttpMethods, url: string, data?: any, options?: any, params: Map<string, any>, http: HttpClient }): Observable<any> => {
  const req: RequestData = { method, url, data, options };

  if (data instanceof Error) {
    // return handleRestfulError(req)(data);
    return of([]);
  }

  let result$: Observable<ArrayBuffer>;

  switch (method) {
    case 'DELETE': {
      result$ = http.delete(url, options);
      if (params.has('saveDelay')) {
        result$ = result$.pipe(delay(+params.get('saveDelay')));
      }
      break;
    }
    case 'GET': {
      result$ = http.get(url, options);
      if (params.has('getDelay')) {
        result$ = result$.pipe(delay(+params.get('getDelay')));
      }
      break;
    }
    case 'POST': {
      result$ = http.post(url, data, options);
      if (params.has('saveDelay')) {
        result$ = result$.pipe(delay(+params.get('saveDelay')));
      }
      break;
    }
    // N.B.: It must return an Update<T>
    case 'PUT': {
      result$ = http.put(url, data, options);
      if (params.has('saveDelay')) {
        result$ = result$.pipe(delay(+params.get('saveDelay')));
      }
      break;
    }
    default: {
      const error = new Error('Unimplemented HTTP method, ' + method);
      result$ = throwError(error);
    }
  }
  if (params.has('timeout')) {
    result$ = result$.pipe(timeout(+params.get('timeout') + +params.get('saveDelay')));
  }
  return result$.pipe(catchError(() => of([])));
}