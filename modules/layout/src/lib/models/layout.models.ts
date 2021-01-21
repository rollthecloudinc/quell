import { Plugin } from 'plugin';
import { Attribute, AttributeValue } from 'attributes';

export class LayoutPlugin<T = string> extends Plugin<T>  {
  settings: Map<string, Array<Attribute>> = new Map<string, Array<Attribute>>();
  constructor(data?: LayoutPlugin<T>) {
    super(data)
    if(data.settings) {
      const attributes = [];
      data.settings.forEach((v, k) => {
        attributes.push([k, v.map(a => new Attribute(a))]);
      });
      this.settings = new Map<string, Array<Attribute>>(attributes);
    }
  }
}

export class LayoutSetting {
  settings: Array<AttributeValue> = []
  constructor(data?: LayoutSetting) {
    if (data) {
      if (data.settings && Array.isArray(data.settings)) {
        this.settings = data.settings.map(v => new AttributeValue(v));
      }
    }
  }
}
