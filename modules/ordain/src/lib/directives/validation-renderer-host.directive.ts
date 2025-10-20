import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[druidValidationRendererHost]',
    standalone: false
})
export class ValidationRendererHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}