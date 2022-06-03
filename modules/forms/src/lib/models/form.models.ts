import { ContentBinding } from '@rollthecloudinc/content';
import { DatasourceOptions } from '@rollthecloudinc/datasource';

export class FormSettings {
  value?: string;
  datasourceBinding?: ContentBinding;
  datasourceOptions?: DatasourceOptions; 
  constructor(data?: FormSettings) {
    if (data) {
      this.value = data.value ? data.value : '';
      if (data.datasourceBinding && typeof(data.datasourceBinding) === 'object') {
        this.datasourceBinding = new ContentBinding(data.datasourceBinding);
      }
      if (data.datasourceOptions && typeof(data.datasourceOptions) === 'object') {
        this.datasourceOptions = new DatasourceOptions(data.datasourceOptions);
      }
    }
  }
}

export class FormSectionForm {
  valuesMapping: string;
  constructor(data: FormSectionForm) {
    if (data) {
      this.valuesMapping = data.valuesMapping;
    }
  }
}