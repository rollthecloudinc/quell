import { Rest, DatasourceOptions } from 'datasource';
export class FormlyFieldInstance {
  type: string;
  key: string;
  options?: FormlyFieldInstanceOptions;
  rest?: Rest;
  datasourceOptions?: DatasourceOptions; 
  constructor(data?: FormlyFieldInstance) {
    if (data) {
      this.type = data.type;
      this.key = data.key;
      if (data.options && typeof(data.options) === 'object') {
        this.options = new FormlyFieldInstanceOptions(data.options);
      }
      if (data.rest && typeof(data.rest) === 'object') {
        this.rest = new Rest(data.rest);
      }
      if (data.datasourceOptions && typeof(data.datasourceOptions) === 'object') {
        this.datasourceOptions = new DatasourceOptions(data.datasourceOptions);
      }
    }
  }
}

export class FormlyFieldInstanceOptions {
  label: string;
  constructor(data?: FormlyFieldInstanceOptions) {
    if (data) {
      this.label = data.label;
    }
  }
}