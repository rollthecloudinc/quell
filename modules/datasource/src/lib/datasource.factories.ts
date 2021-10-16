import { DatasourcePlugin, Dataset } from './models/datasource.models';
import { DataDatasourceComponent } from './components/data-datasource/data-datasource.component';
import { of } from 'rxjs';
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { map, switchMap } from 'rxjs/operators';

export const dataDatasourcePluginFactory = (
  attrbuteSerializer: AttributeSerializerService
) => {
  return new DatasourcePlugin<string>({ 
    id: 'data', 
    title: 'Data',  
    editor: DataDatasourceComponent,
    fetch: ({ settings }: { settings: Array<AttributeValue> }) => of(new Dataset()).pipe(
      map(() => attrbuteSerializer.deserializeAsObject(settings)),
      map(s => new Dataset({ results: JSON.parse(s.data) })),
    )
  });
};