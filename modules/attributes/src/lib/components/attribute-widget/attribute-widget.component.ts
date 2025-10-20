import { Component, OnInit, Input, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { ControlContainer } from "@angular/forms";
import { AttributeWidget, Attribute } from '../../models/attributes.models';
import { AttributeWidgetDirective } from '../../directives/attribute-widget.directive';
import { Observable } from 'rxjs';
@Component({
    selector: 'classifieds-ui-attribute-widget',
    styleUrls: ['./attribute-widget.component.scss'],
    template: `<ng-container [formGroup]="controlContainer.control"><ng-template classifiedsUiWidgetHost></ng-template></ng-container>`,
    standalone: false
})
export class AttributeWidgetComponent implements OnInit {

  @Input()
  widget: Observable<AttributeWidget<string>>;

  @Input()
  attribute: Attribute;

  @Input()
  appearance = "legacy"

  @ViewChild(AttributeWidgetDirective, {static: true}) widgetHost: AttributeWidgetDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, public controlContainer: ControlContainer) { }

  ngOnInit() {

    this.widget.subscribe(widget => {

      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(widget.component);

      const viewContainerRef = this.widgetHost.viewContainerRef;
      viewContainerRef.clear();

      const componentRef = viewContainerRef.createComponent(componentFactory);
      (componentRef.instance as any).attribute = this.attribute;
      (componentRef.instance as any).appearance = this.appearance;

    });

  }

}
