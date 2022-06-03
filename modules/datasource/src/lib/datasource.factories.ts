import { DatasourcePlugin, Dataset } from './models/datasource.models';
import { DataDatasourceComponent } from './components/data-datasource/data-datasource.component';
import { of } from 'rxjs';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { map } from 'rxjs/operators';
import { DatasourceSourceComponent } from './components/datasource-source/datasource-source.component';

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

export const datasourceDatasourcePluginFactory = (
  attrbuteSerializer: AttributeSerializerService
) => {
  return new DatasourcePlugin<string>({ 
    id: 'datasource_datasource', 
    title: 'Datasource',  
    editor: DatasourceSourceComponent,
    fetch: ({ settings }: { settings: Array<AttributeValue> }) => of(new Dataset())
  });
};