import { Pipe, PipeTransform } from '@angular/core';
import * as numeral from 'numeral';

@Pipe({
  name: 'numeral'
})
export class NumeralPipe implements PipeTransform {

  transform(value: unknown, format: string): unknown {
    if(value === undefined || value === '') {
      return;
    }
    return numeral(value).format(format);
  }

}
