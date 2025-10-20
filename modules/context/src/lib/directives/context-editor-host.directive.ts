import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[classifiedsUiContextEditorHost]',
    standalone: false
})
export class ContextEditorHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
