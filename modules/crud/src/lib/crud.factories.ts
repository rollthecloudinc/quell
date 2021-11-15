import { AttributeSerializerService, AttributeValue } from "attributes";
// import { ParamContextExtractorService } from "context";
import { Dataset, DatasourceEditorOptions, DatasourcePlugin } from "datasource";
import { forkJoin, of } from "rxjs";
import { CrudAdaptorDatasourceComponent } from './components/crud-adaptor-datasource/crud-adaptor-datasource.component';
import { ParamContextExtractorService } from "context";
import { CrudAdaptorPluginManager } from "./services/crud-adaptor-plugin-manager.service";
import { map, switchMap } from "rxjs/operators";
import { CrudAdaptorDatasource } from "./models/crud.models";
import { UrlGeneratorService } from "durl";
import { Param, ParamEvaluatorService } from "dparam";

export const crudAdaptorDatasourcePluginFactory = (
  paramContextExtractor: ParamContextExtractorService,
  attributeSerializer: AttributeSerializerService,
  cpm: CrudAdaptorPluginManager,
  paramEvaluatorService: ParamEvaluatorService
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
      map(({ plugin, ds }) => ({ plugin, ds, optionNames: ds.optionsString.split('&').filter(v => v.indexOf('=:') === 0).map(v => v.split('=', 2)[1]) })),
      map(({ plugin, ds, optionNames }) => ({ plugin, ds, optionNames, paramNames: ds.paramsString.split('&').filter(v => v.indexOf('=:') === 0).map(v => v.split('=', 2)[1]) })),
      switchMap(({ plugin, ds, optionNames, paramNames }) => forkJoin([
        paramEvaluatorService.paramValues(ds.options.reduce((p, c, i) => new Map<string, Param>([ ...p, [ optionNames[i], c ] ]), new Map<string, Param>())).pipe(
          map(params => Array.from(params).reduce((p, [v, k]) =>  ({ ...p, [k]: v }), {}))
        ),
        paramEvaluatorService.paramValues(ds.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())).pipe(
          map(params => Array.from(params).reduce((p, [v, k]) =>  ({ ...p, [k]: v }), {}))
        )
      ]).pipe(
        map(([ options, params ]) => ({ plugin, options, params }))
      )),
      // switchMap(({ plugin, options, params }) => plugin.query()),
      // map(res => new Dataset({ res.items }))
      map(() => new Dataset())
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