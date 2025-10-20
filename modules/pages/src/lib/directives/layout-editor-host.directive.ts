import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[classifiedsUiLayoutEditorHost]',
    standalone: false
})
export class LayoutEditorHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}