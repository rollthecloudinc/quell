import { ContentBinding } from '@rollthecloudinc/content';
import { DatasourceOptions } from '@rollthecloudinc/datasource';
import { ValidationValidator, FormValidation } from '@rollthecloudinc/ordain';

export class FormSettings {
  value?: string;
  datasourceBinding?: ContentBinding;
  datasourceOptions?: DatasourceOptions; 
  validation?: FormValidation;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  constructor(data?: FormSettings) {
    if (data) {
      this.value = data.value ? data.value : '';
      this.min = data.min && `${data.min}` !== '' ? parseInt(`${data.min}`) : undefined;
      this.max = data.max && `${data.max}` !== '' ? parseInt(`${data.max}`) : undefined;
      this.step = data.step && `${data.step}` !== '' ? parseInt(`${data.step}`) : undefined;
      if (data.datasourceBinding && typeof(data.datasourceBinding) === 'object') {
        this.datasourceBinding = new ContentBinding(data.datasourceBinding);
      }
      if (data.datasourceOptions && typeof(data.datasourceOptions) === 'object') {
        this.datasourceOptions = new DatasourceOptions(data.datasourceOptions);
      }
      if (data.validation) {
        this.validation = new FormValidation(data.validation);
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