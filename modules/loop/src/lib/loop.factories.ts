import { AttributeSerializerService, AttributeValue } from "attributes";
import { InlineContext } from "context";
import { DatasourceEvaluator, DatasourcePlugin, Dataset, Datasource } from 'datasource';
import { forkJoin, of } from "rxjs";
import { defaultIfEmpty, map, switchMap, take } from "rxjs/operators";
import { LoopDatasourceComponent } from "./components/loop-datasource/loop-datasource.component";
import { LoopDatasource } from "./models/loop.models";

export const loopDatasourcePluginFactory = (
  attrbuteSerializer: AttributeSerializerService,
  datasourceEvaluator: DatasourceEvaluator
) => {
  return new DatasourcePlugin<string>({ 
    id: 'loop', 
    title: 'loop',  
    editor: LoopDatasourceComponent,
    fetch: ({ settings, dataset, datasource, metadata, datasources }: { settings: Array<AttributeValue>, metadata?: Map<string, any>, dataset?: Dataset, datasource?: Datasource, datasources?: Map<string, Datasource> }) => of(new Dataset()).pipe(
      map(() => attrbuteSerializer.deserializeAsObject(settings)),
      map(s => s ? new LoopDatasource(s) : undefined),
      switchMap(s => forkJoin(dataset ? dataset.results.map(row => datasourceEvaluator.evalDatasource({ datasource: new Datasource({ plugin: 'data', renderer: datasource.renderer, settings: attrbuteSerializer.serialize({ data: JSON.stringify(dataset.results) }, 'root').attributes }), datasources, metadata: new Map<string, any>([ ...(metadata ? Array.from(metadata).filter(([k]) => k !== 'contexts') : []), [ 'contexts', [ ...(metadata.has('contexts') && Array.isArray(metadata.get('contexts')) ? (metadata.get('contexts') as Array<InlineContext>).filter(ctx => ctx.name !== '_root') : []), new InlineContext({ name: "_root", adaptor: 'data', data: row }) ] ] ]) }).pipe(take(1))): []).pipe(
        map(sets => new Dataset({ results: sets.reduce((p, c) => [ ...p, ...c.results ], []) })),
        defaultIfEmpty(new Dataset({ results: [] }))
      ))
    )
  });
};