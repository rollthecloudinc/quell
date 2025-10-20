import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[classifiedsUiDatasourceRendererHost]',
    standalone: false
})
export class DatasourceRendererHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}