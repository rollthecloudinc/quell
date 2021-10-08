import { DatasourcePlugin } from './models/datasource.models';
import { DataDatasourceComponent } from './components/data-datasource/data-datasource.component';

export const dataDatasourcePluginFactory = () => {
  return new DatasourcePlugin<string>({ id: 'data', title: 'Data',  editor: DataDatasourceComponent });
};