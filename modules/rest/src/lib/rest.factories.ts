import { AttributeValue } from 'attributes';
import { Dataset, DatasourcePlugin, DatasourceEditorOptions } from 'datasource';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RestDatasourceComponent } from './components/rest-datasource/rest-datasource.component';
import { AttributeSerializerService } from 'attributes';
import { RestFetchHelperService } from './services/rest-fetch-helper.service';
import { ContentBinding } from 'content';

export const restDatasourcePluginFactory = (fetchhelper: RestFetchHelperService) => {
  return new DatasourcePlugin<string>({ 
    id: 'rest', 
    title: 'Rest', 
    editor: RestDatasourceComponent,
    fetch: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata: Map<string, any> }) => fetchhelper.fetchDataset({ settings, metadata }),
    editorOptions: () => of(new DatasourceEditorOptions({ fullscreen: true })),
    getBindings: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata?: Map<string, any> }) => of([new ContentBinding({ id: 'filter_form', type: 'context' })])
  });
};