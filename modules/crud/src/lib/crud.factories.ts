import { AttributeSerializerService, AttributeValue } from '@ng-druid/attributes';
// import { ParamContextExtractorService } from '@ng-druid/context';
import { Dataset, DatasourceEditorOptions, DatasourcePlugin } from '@ng-druid/datasource';
import { forkJoin, of } from "rxjs";
import { CrudAdaptorDatasourceComponent } from './components/crud-adaptor-datasource/crud-adaptor-datasource.component';
import { ParamContextExtractorService } from '@ng-druid/context';
import { CrudAdaptorPluginManager } from "./services/crud-adaptor-plugin-manager.service";
import { map, switchMap, take } from "rxjs/operators";
import { CrudAdaptorDatasource } from "./models/crud.models";
import { UrlGeneratorService } from '@ng-druid/durl';
import { Param, ParamEvaluatorService } from '@ng-druid/dparam';
import { CrudDataHelperService } from "./services/crud-data-helper.service";

export const crudAdaptorDatasourcePluginFactory = (
  paramContextExtractor: ParamContextExtractorService,
  attributeSerializer: AttributeSerializerService,
  cpm: CrudAdaptorPluginManager,
  paramEvaluatorService: ParamEvaluatorService,
  crudDataHelper: CrudDataHelperService,
  urlGenerator: UrlGeneratorService
) => {
  return new DatasourcePlugin<string>({ 
    id: 'crud_adaptor', 
    title: 'Crud Adaptor', 
    editor: CrudAdaptorDatasourceComponent,
    fetch: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata: Map<string, any> }) => of(new Dataset()).pipe(
      map(() => attributeSerializer.deserializeAsObject(settings)),
      map<any, CrudAdaptorDatasource>(s => new CrudAdaptorDatasource(s)),
      switchMap(ds => cpm.getPlugin(ds.adaptorName).pipe(
        map(plugin => ({ plugin, ds }))
      )),
      map(({ plugin, ds }) => ({ plugin, ds, optionNames: ds.optionsString ? ds.optionsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [] })),
      switchMap(({ plugin, ds, optionNames }) => forkJoin([
        paramEvaluatorService.paramValues(ds.options.reduce((p, c, i) => new Map<string, Param>([ ...p, [ optionNames[i], c ] ]), new Map<string, Param>())).pipe(
          map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
        ),
        ds.paramsString && ds.paramsString !== '' ? urlGenerator.getUrl('?' + ds.paramsString, ds.params, metadata).pipe(take(1)) : of(undefined)
      ]).pipe(
        map(([ options, query ]) => ({ plugin, options, query }))
      )),
      switchMap(({ plugin, options, query }) => crudDataHelper.evaluateCollectionPlugins({ plugins: { [plugin.id]: { params: options } }, op: 'query', query: query ? query.substr(1) : query })),
      map(results => new Dataset({ results }))
    ),
    editorOptions: () => of(new DatasourceEditorOptions({ fullscreen: true })),
    getBindings: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata?: Map<string, any> }) => of([])/*.pipe(
      map(() => attributeSerializer.deserializeAsObject(settings)),
      map<any, CrudAdaptorDatasource>(s => new EntityDatasource(s)),
      switchMap(ds => paramContextExtractor.extractContexts(ds.params)),
      map(contexts => contexts.map(id => new ContentBinding({ id, type: 'context' })))
    )*/
  });
};