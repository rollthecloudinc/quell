import { Pipe, PipeTransform } from '@angular/core';
import * as numberString from "number-string";

@Pipe({
    name: 'numeral',
    standalone: false
})
export class NumeralPipe implements PipeTransform {

  transform(value: unknown, format: string): unknown {
    if(value === undefined || value === '') {
      return;
    }
    // @todo: reimplment format.
    // return toNumber(`${value}`).format(format);
    return numberString.toNumber(`${value}`);
  }

}
