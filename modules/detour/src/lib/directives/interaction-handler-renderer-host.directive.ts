import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[druidInteractionHandlerRendererHost]'
})
export class InteractionHandlerRendererHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}