import { AttributeValue } from '@ng-druid/attributes';

export class SelectOption {
  // value: AttributeValue;
  value: any;
  label: string;
  dataItem: any;
  constructor(data?: SelectOption) {
    if(data) {
      this.label = data.label;
      this.dataItem = data.dataItem;
      if(data.value !== undefined) {
        // this.value = new AttributeValue(data.value);
        this.value = data.value;
      }
    }
  }
}

export class SelectMapping {
  value: string;
  label: string;
  id: string;
  multiple: boolean;
  limit: number;
  constructor(data?: SelectMapping) {
    if(data) {
      this.value = data.value;
      this.label = data.label;
      this.id = data.id;
      this.multiple = data.multiple;
      this.limit = data.limit;
    }
  }
}