import { ContentBinding } from '@ng-druid/content';
import { Rest, DatasourceOptions } from '@ng-druid/datasource';
export class FormlyFieldInstance {
  type: string;
  key: string;
  options?: FormlyFieldInstanceOptions;
  rest?: Rest;
  value?: string;
  datasourceBinding?: ContentBinding;
  datasourceOptions?: DatasourceOptions; 
  constructor(data?: FormlyFieldInstance) {
    if (data) {
      this.type = data.type;
      this.key = data.key;
      this.value = data.value !== undefined && data.value !== null ? data.value : undefined;
      if (data.options && typeof(data.options) === 'object') {
        this.options = new FormlyFieldInstanceOptions(data.options);
      }
      if (data.rest && typeof(data.rest) === 'object') {
        this.rest = new Rest(data.rest);
      }
      if (data.datasourceBinding && typeof(data.datasourceBinding) === 'object') {
        this.datasourceBinding = new ContentBinding(data.datasourceBinding);
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

export class FormlyRepeatingForm {
  valuesMapping: string;
  constructor(data: FormlyRepeatingForm) {
    if (data) {
      this.valuesMapping = data.valuesMapping;
    }
  }
}