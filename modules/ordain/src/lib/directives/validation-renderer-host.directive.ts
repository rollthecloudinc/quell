import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[druidValidationRendererHost]'
})
export class ValidationRendererHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}