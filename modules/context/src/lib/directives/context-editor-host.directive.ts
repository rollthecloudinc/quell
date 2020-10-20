import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[classifiedsUiContextEditorHost]'
})
export class ContextEditorHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
