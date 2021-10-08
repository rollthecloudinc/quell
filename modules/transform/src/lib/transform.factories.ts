import { Dataset, DatasourcePlugin } from 'datasource';
import { TransformSelectComponent } from './components/transform-select/transform-select.component';
import { TransformMergeComponent } from './components/transform-merge/transform-merge.component';
import { of } from 'rxjs';
import { AttributeValue } from 'attributes';

export const selectDatasourcePluginFactory = () => {
  return new DatasourcePlugin<string>({ 
    id: 'select', 
    title: 'Select', 
    editor: TransformSelectComponent,
    fetch: ({ settings }: { settings: Array<AttributeValue> }) => of(new Dataset())
  })
};

export const mergeDatasourcePluginFactory = () => {
  return new DatasourcePlugin<string>({ 
    id: 'merge', 
    title: 'Merge', 
    editor: TransformMergeComponent,
    fetch: ({ settings }: { settings: Array<AttributeValue> }) => of(new Dataset())
  })
};