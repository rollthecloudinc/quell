import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

class Context {
  constructor(public index: number, public length: number) { }
  get even(): boolean { return this.index % 2 === 0; }
  get odd(): boolean { return this.index % 2 === 1; }
  get first(): boolean { return this.index === 0; }
  get last(): boolean { return this.index === this.length - 1; }
}

@Directive({
    selector: '[for]:not(label)',
    standalone: false
})
export class ForDirective {
  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) { }

  @Input('for') set loop(num: number) {
    this.viewContainer.clear();
    for (var i = 0; i < num; i++)
      this.viewContainer.createEmbeddedView(this.templateRef, new Context(i, num));
  }
}
