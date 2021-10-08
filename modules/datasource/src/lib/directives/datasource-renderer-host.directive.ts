import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[classifiedsUiDatasourceRendererHost]'
})
export class DatasourceRendererHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}