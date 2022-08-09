import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[druidInteractionActionRendererHost]'
})
export class InteractionActionRendererHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}