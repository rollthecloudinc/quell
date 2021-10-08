import { DatasourcePlugin, Dataset } from './models/datasource.models';
import { DataDatasourceComponent } from './components/data-datasource/data-datasource.component';
import { of } from 'rxjs';
import { AttributeValue } from 'attributes';

export const dataDatasourcePluginFactory = () => {
  return new DatasourcePlugin<string>({ 
    id: 'data', 
    title: 'Data',  
    editor: DataDatasourceComponent,
    fetch: ({ settings }: { settings: Array<AttributeValue> }) => of(new Dataset())
  });
};