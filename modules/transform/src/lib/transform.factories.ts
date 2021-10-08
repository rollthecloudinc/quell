import { DatasourcePlugin } from 'datasource';
import { TransformSelectComponent } from './components/transform-select/transform-select.component';
import { TransformMergeComponent } from './components/transform-merge/transform-merge.component';

export const selectDatasourcePluginFactory = () => {
  return new DatasourcePlugin<string>({ id: 'select', title: 'Select', editor: TransformSelectComponent })
};

export const mergeDatasourcePluginFactory = () => {
  return new DatasourcePlugin<string>({ id: 'merge', title: 'Merge', editor: TransformMergeComponent })
};