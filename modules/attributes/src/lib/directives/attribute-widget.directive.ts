import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[classifiedsUiWidgetHost]'
})
export class AttributeWidgetDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
