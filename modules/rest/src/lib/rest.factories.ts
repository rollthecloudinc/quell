import { DatasourcePlugin } from 'datasource';
import { RestSourceFormComponent } from './components/rest-source-form/rest-source-form.component';

export const restDatasourcePluginFactory = () => {
  return new DatasourcePlugin<string>({ id: 'rest', title: 'Rest', editor: RestSourceFormComponent });
};