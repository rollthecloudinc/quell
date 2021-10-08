import { DatasourcePlugin } from 'datasource';
import { RestDatasourceComponent } from './components/rest-datasource/rest-datasource.component';

export const restDatasourcePluginFactory = () => {
  return new DatasourcePlugin<string>({ id: 'rest', title: 'Rest', editor: RestDatasourceComponent });
};