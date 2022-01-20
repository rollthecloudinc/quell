import { Pipe, PipeTransform } from '@angular/core';
import { toNumber } from "number-string";

@Pipe({
  name: 'numeral'
})
export class NumeralPipe implements PipeTransform {

  transform(value: unknown, format: string): unknown {
    if(value === undefined || value === '') {
      return;
    }
    // @todo: reimplment format.
    // return toNumber(`${value}`).format(format);
    return toNumber(`${value}`);
  }

}
