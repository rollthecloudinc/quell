import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
// import { ParamContextExtractorService } from '@rollthecloudinc/context';
import { Dataset, DatasourceEditorOptions, DatasourcePlugin } from '@rollthecloudinc/datasource';
import { DataductPlugin, DuctdataOutput, DuctdataInput } from '@rollthecloudinc/refinery';
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { EntityDatasource } from "./models/deity.models";
import { EntityDatasourceComponent } from "./components/entity-datasource/entity-datasource.component";
import { ParamContextExtractorService } from '@rollthecloudinc/context';
import { ContentBinding } from '@rollthecloudinc/content';
import { UrlGeneratorService } from '@rollthecloudinc/durl';
import { EntityServices } from "@ngrx/data";

export const entityDatasourcePluginFactory = (
  paramContextExtractor: ParamContextExtractorService,
  attributeSerializer: AttributeSerializerService,
  urlGenerator: UrlGeneratorService,
  es: EntityServices,
) => {
  return new DatasourcePlugin<string>({ 
    id: 'entity', 
    title: 'Entity', 
    editor: EntityDatasourceComponent,
    fetch: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata: Map<string, any> }) => of(new Dataset()).pipe(
      map(() => attributeSerializer.deserializeAsObject(settings)),
      map<any, EntityDatasource>(s => new EntityDatasource(s)),
      switchMap(e => urlGenerator.getUrl('?' + e.queryString, e.params, metadata).pipe(
        map(queryString => ({ e, queryString }))
      )),
      map(({ e, queryString }) => ({ e, queryString: queryString.substr(1) })),
      switchMap(({ e, queryString }) => queryString && queryString !== '' ? es.getEntityCollectionService(e.entityName).getWithQuery(queryString) : es.getEntityCollectionService(e.entityName).getAll()),
      map(results => new Dataset({ results }))
    ),
    editorOptions: () => of(new DatasourceEditorOptions({ fullscreen: true })),
    getBindings: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata?: Map<string, any> }) => of([]).pipe(
      map(() => attributeSerializer.deserializeAsObject(settings)),
      map<any, EntityDatasource>(s => new EntityDatasource(s)),
      switchMap(ds => paramContextExtractor.extractContexts(ds.params)),
      map(contexts => contexts.map(id => new ContentBinding({ id, type: 'context' })))
    )
  });
};

export const entityDataductPluginFactory = () => new DataductPlugin({
  id: 'entity',
  title: 'Entity',
  editor: EntityDatasourceComponent,
  send: (input: DuctdataInput): Observable<DuctdataOutput> => of(new DuctdataOutput({}))
});