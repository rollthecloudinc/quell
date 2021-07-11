import { DatasourceOptions, Rest } from '../models/datasource.models';

export const mockDatasourceOptions = new DatasourceOptions({
  query: '',
  trackBy: '',
  idMapping: '',
  labelMapping: '',
  valueMapping: '',
  multiple: false,
  limit: 0,
});

export const mockRest = new Rest({
  url: '',
  renderer: {
    type: '',
    data: {
      content: '',
      contentType: ''
    },
    query: '',
    trackBy: '',
    bindings: []
  },
  params: []
});