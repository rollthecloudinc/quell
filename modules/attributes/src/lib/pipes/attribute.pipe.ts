import { Pipe, PipeTransform } from '@angular/core';
import { AttributeMatcherService } from '../services/attribute-matcher.service';
import { AttributeValue } from '../models/attributes.models';

@Pipe({
  name: 'attribute'
})
export class AttributePipe implements PipeTransform {

  constructor(private attributeMatcher: AttributeMatcherService) {
  }

  transform(attributes: Array<AttributeValue>, attr: string): string {
    const computedValue = this.attributeMatcher.getComputedValue(attr, attributes);
    if(computedValue) {
      return computedValue;
    } else {
      return '';
    }
  }

}
