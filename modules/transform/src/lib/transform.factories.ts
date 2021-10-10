import { Dataset, DatasourcePlugin } from 'datasource';
import { TransformSelectComponent } from './components/transform-select/transform-select.component';
import { TransformMergeComponent } from './components/transform-merge/transform-merge.component';
import { iif, of } from 'rxjs';
import { AttributeValue } from 'attributes';
import { map } from 'rxjs/operators';
import { JSONPath } from 'jsonpath-plus';

export const selectDatasourcePluginFactory = () => {
  return new DatasourcePlugin<string>({ 
    id: 'select', 
    title: 'Select', 
    editor: TransformSelectComponent,
    fetch: ({ settings, dataset }: { settings: Array<AttributeValue>, dataset?: Dataset }) => iif(
      () => !!dataset,
      of(dataset).pipe(
        map(json => new Dataset({ results: JSONPath({ path: '$..data.results.*', json }) }))
      ),
      of(new Dataset())
    )
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