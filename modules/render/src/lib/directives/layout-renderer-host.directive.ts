import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[classifiedsUiLayoutRendererHost]',
    standalone: false
})
export class LayoutRendererHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}