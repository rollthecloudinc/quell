import { ContentBinding } from "content";
import { DatasourceOptions } from "datasource";

export class FormSettings {
  value?: string;
  datasourceBinding?: ContentBinding;
  datasourceOptions?: DatasourceOptions; 
  constructor(data?: FormSettings) {
    if (data) {
      if (data.datasourceBinding && typeof(data.datasourceBinding) === 'object') {
        this.datasourceBinding = new ContentBinding(data.datasourceBinding);
      }
      if (data.datasourceOptions && typeof(data.datasourceOptions) === 'object') {
        this.datasourceOptions = new DatasourceOptions(data.datasourceOptions);
      }
    }
  }
}