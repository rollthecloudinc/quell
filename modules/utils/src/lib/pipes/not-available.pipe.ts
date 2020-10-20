import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'na'
})
export class NotAvailablePipe implements PipeTransform {

  transform(value: unknown, defaultValue: 'N/A'): unknown {
    return !value || value === '' ? defaultValue : value;
  }

}
