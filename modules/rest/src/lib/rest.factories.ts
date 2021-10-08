import { AttributeValue } from 'attributes';
import { Dataset, DatasourcePlugin } from 'datasource';
import { of } from 'rxjs';
import { RestDatasourceComponent } from './components/rest-datasource/rest-datasource.component';

export const restDatasourcePluginFactory = () => {
  return new DatasourcePlugin<string>({ 
    id: 'rest', 
    title: 'Rest', 
    editor: RestDatasourceComponent,
    fetch: ({ settings }: { settings: Array<AttributeValue> }) => of(new Dataset())
  });
};