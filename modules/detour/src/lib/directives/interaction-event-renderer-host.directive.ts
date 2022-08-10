import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[druidInteractionEventRendererHost]'
})
export class InteractionEventRendererHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}