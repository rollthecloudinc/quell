import { Injectable } from '@angular/core';
import { AttributeValue } from '../models/attributes.models';

@Injectable({
  providedIn: 'root'
})
export class AttributeMatcherService {

  getComputedValue(attr: string, attributes?: Array<AttributeValue>): string | undefined {
    const attribute = attributes && attributes.length > 0 && this.matchAttribute(attr, attributes);
    if(attribute) {
      return attribute.computedValue;
    } else {
      return;
    }
  }

  getValue(attr: string, attributes?: Array<AttributeValue>): string | undefined {
    const attribute = attributes && attributes.length > 0 && this.matchAttribute(attr, attributes);
    if(attribute) {
      return attribute.value;
    } else {
      return;
    }
  }

  matchAttribute(attr: string, attributes: Array<AttributeValue>): undefined | AttributeValue {
    const len = attributes.length;
    for(let i = 0; i < len; i++) {
      if(attributes[i].attributes && attributes[i].attributes.length > 0) {
        const value = this.matchAttribute(attr, attributes[0].attributes);
        if(value) {
          return attributes[i];
        } else {
          continue;
        }
      } else if(attr === attributes[i].name) {
        return attributes[i];
      } else {
        continue;
      }
    }
  }

}
