import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[classifiedsUiPaneContentHost]'
})
export class PaneContentHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
