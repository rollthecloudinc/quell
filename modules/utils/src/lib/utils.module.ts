import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumeralPipe } from './pipes/numeral.pipe';
import { NotAvailablePipe } from './pipes/not-available.pipe';
import { DynamicContentViewer } from './components/dynamic-content-viewer/dynamic-content-viewer.component';
import { ForDirective } from './directives/for.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [NumeralPipe, NotAvailablePipe, DynamicContentViewer, ForDirective],
  exports: [NumeralPipe, NotAvailablePipe, DynamicContentViewer, ForDirective]
})
export class UtilsModule {}
