import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'na',
    standalone: false
})
export class NotAvailablePipe implements PipeTransform {

  transform(value: unknown, defaultValue: 'N/A'): unknown {
    return !value || value === '' ? defaultValue : value;
  }

}
