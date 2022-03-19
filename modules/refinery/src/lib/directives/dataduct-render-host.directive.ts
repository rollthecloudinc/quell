import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[classifiedsUiDataductRendererHost]'
})
export class DataductRenderHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}