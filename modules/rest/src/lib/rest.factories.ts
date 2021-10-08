import { DatasourcePlugin } from 'datasource';
import { Rest2FormComponent } from './components/rest2-form/rest2-form.component';

export const restDatasourcePluginFactory = () => {
  return new DatasourcePlugin<string>({ id: 'rest', title: 'Rest', editor: Rest2FormComponent });
};