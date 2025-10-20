import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[classifiedsUiWidgetHost]',
    standalone: false
})
export class AttributeWidgetDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
