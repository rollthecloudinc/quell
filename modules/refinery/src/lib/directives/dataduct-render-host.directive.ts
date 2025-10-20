import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[classifiedsUiDataductRendererHost]',
    standalone: false
})
export class DataductRenderHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}