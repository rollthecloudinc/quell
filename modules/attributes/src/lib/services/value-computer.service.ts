import { Injectable } from '@angular/core';
import * as numeral from 'numeral';
import { AttributeValue, AttributeTypes } from '../models/attributes.models';

@Injectable({
  providedIn: 'root'
})
export class ValueComputerService {
  constructor() { }
  compute(attributes: Array<AttributeValue>): Array<AttributeValue> {
    const computedAttributes: Array<AttributeValue> = [];
    attributes.forEach(a => computedAttributes.push(this.computeAttribute(a)));
    return computedAttributes;
  }
  computeAttribute(attribute: AttributeValue): AttributeValue {
    const computedValue = this.resolveComputedValue(attribute.value, attribute.type);
    if(attribute.attributes && attribute.attributes.length > 0) {
      return new AttributeValue({ ...attribute, computedValue, attributes: this.compute(attribute.attributes)});
    } else {
      return new AttributeValue({ ...attribute, computedValue });
    }
  }
  /**
   * @todo: Support below strings.
   * beds: 1.5
   * beds: 1 1/2
   * price: $1,000
   * price: 1,000
   * price $1,000,000.00
   * baths: one
   */
  resolveComputedValue(value: string, type: AttributeTypes): string | undefined {
    let computedValue: any;
    if (type === AttributeTypes.Number) {
      computedValue = numeral(value.trim()).value();
      if(computedValue && isNaN(computedValue)) {
        computedValue = undefined;
      }
    } else {
      computedValue = value.trim();
    }
    return computedValue === undefined ? computedValue : `${computedValue}`;
  }
}
