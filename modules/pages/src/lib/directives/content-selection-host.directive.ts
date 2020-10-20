import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[classifiedsUiContentSelectionHost]'
})
export class ContentSelectionHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
