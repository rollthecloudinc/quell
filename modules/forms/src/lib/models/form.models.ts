import { ContentBinding } from '@rollthecloudinc/content';
import { DatasourceOptions } from '@rollthecloudinc/datasource';
import { ValidationValidator } from '@rollthecloudinc/ordain';

export class FormSettings {
  value?: string;
  datasourceBinding?: ContentBinding;
  datasourceOptions?: DatasourceOptions; 
  validation?: FormValidation;
  constructor(data?: FormSettings) {
    if (data) {
      this.value = data.value ? data.value : '';
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

export class FormValidation {
  validators: Array<ValidationValidator>;
  constructor(data: FormValidation) {
    if (data && Array.isArray(data.validators)) {
      this.validators = data.validators.map(v => new ValidationValidator(v));
    }
  }
}