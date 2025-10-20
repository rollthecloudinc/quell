import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[classifiedsUiPaneContentHost]',
    standalone: false
})
export class PaneContentHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
