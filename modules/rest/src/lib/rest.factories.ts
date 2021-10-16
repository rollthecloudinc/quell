import { AttributeValue } from 'attributes';
import { Dataset, DatasourcePlugin, DatasourceEditorOptions, Datasource, Rest } from 'datasource';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RestDatasourceComponent } from './components/rest-datasource/rest-datasource.component';
import { AttributeSerializerService } from 'attributes';
import { RestFetchHelperService } from './services/rest-fetch-helper.service';
import { ContentBinding } from 'content';
import { ParamContextExtractorService } from 'context';

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