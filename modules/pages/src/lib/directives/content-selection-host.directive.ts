import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[classifiedsUiContentSelectionHost]',
    standalone: false
})
export class ContentSelectionHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
