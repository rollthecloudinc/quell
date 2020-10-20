import { Type } from '@angular/core';

export enum AttributeTypes {
  Number,
  Text,
  Complex,
  Float,
  Array,
  Bool
}

export class AttributeWidget {
  name: string;
  component: Type<any>;
  schema?: Attribute;
  constructor(data?: AttributeWidget) {
    if (data) {
      this.name = data.name;
      this.schema = data.schema ? new Attribute(data.schema) : undefined;
      this.component = data.component;
    }
  }
}

export class Attribute {
  name: string;
  type: AttributeTypes;
  label: string;
  required: boolean;
  widget: string;
  options: any;
  attributes: Array<Attribute> = [];
  constructor(data?: Attribute) {
    if (data) {
      this.name = data.name;
      this.widget = data.widget !== undefined ? data.widget : 'text';
      this.type = data.type;
      this.label = data.label;
      this.required = data.required;
      this.options = data.options;
      if (data.attributes) {
        this.attributes = data.attributes.map(a => new Attribute(a));
      }
    }
  }
}

export class AttributeValue {
  name: string;
  displayName: string;
  type: AttributeTypes;
  value: string;
  intValue: number;
  computedValue: string;
  attributes: Array<AttributeValue> = [];
  constructor(data?: AttributeValue) {
    if (data) {
      this.name = data.name;
      this.displayName = data.displayName;
      this.type = data.type;
      this.value = data.value;
      this.intValue = data.intValue;
      this.computedValue = data.computedValue;
      if (data.attributes) {
        if(Array.isArray(data.attributes)) {
          this.attributes = data.attributes.reduce<Array<AttributeValue>>((p, a) => ((a as any)._store === undefined || (a as any)._store) ? [ ...p, new AttributeValue(a) ] : p, []);
        } else if((data.attributes as any)._store === undefined || (data.attributes as any)._store) {
          this.attributes = [data.attributes];
        }
      }
      if(data.value && typeof(data.value) === 'object') {
        this.value = undefined;
        this.type = AttributeTypes.Complex;
        (data.value as AttributeValue).attributes.reduce<Array<AttributeValue>>((p, a) => ((a as any)._store === undefined || (a as any)._store) ? [ ...p, new AttributeValue(a) ] : p, []);
      } else {
        this.value = data.value;
      }
    }
  }
}
