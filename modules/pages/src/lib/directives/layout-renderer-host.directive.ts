import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[classifiedsUiLayoutRendererHost]'
})
export class LayoutRendererHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}