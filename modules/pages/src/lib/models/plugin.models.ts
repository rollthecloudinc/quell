import { AttributeValue } from '@classifieds-ui/attributes';

export class Snippet {
  content: string;
  contentType: string;
  constructor(data?: Snippet) {
    if(data) {
      this.content = data.content;
      this.contentType = data.contentType;
    }
  }
}

export class DataSlice {
  context: string;
  query: string;
  plugin: string;
  constructor(data?: DataSlice) {
    if(data) {
      this.context = data.context;
      this.query = data.query;
      this.plugin = data.plugin;
    }
  }
}

export class SelectOption {
  value: AttributeValue;
  label: string;
  dataItem: any;
  constructor(data?: SelectOption) {
    if(data) {
      this.label = data.label;
      this.dataItem = data.dataItem;
      if(data.value !== undefined) {
        this.value = new AttributeValue(data.value);
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
