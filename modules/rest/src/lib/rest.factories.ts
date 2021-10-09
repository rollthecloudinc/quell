import { AttributeValue } from 'attributes';
import { Dataset, DatasourcePlugin } from 'datasource';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RestDatasourceComponent } from './components/rest-datasource/rest-datasource.component';
import { AttributeSerializerService } from 'attributes';
import { RestFetchHelperService } from './services/rest-fetch-helper.service';

export const restDatasourcePluginFactory = (fetchhelper: RestFetchHelperService) => {
  return new DatasourcePlugin<string>({ 
    id: 'rest', 
    title: 'Rest', 
    editor: RestDatasourceComponent,
    fetch: ({ settings }: { settings: Array<AttributeValue> }) => fetchhelper.fetchDataset({ settings })
  });
};