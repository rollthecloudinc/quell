import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[classifiedsUiLayoutEditorHost]'
})
export class LayoutEditorHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}