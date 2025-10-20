import { Type, Component, NgModule, VERSION, Inject, ComponentFactoryResolver, InjectionToken,Injector, ElementRef, Output, Input, EventEmitter, ComponentFactory, ComponentRef} from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EMBEDDABLE_COMPONENT } from '../../utils.tokens';

@Component({
    selector: 'classifieds-ui-dynamic-content-viewer',
    template: '',
    standalone: false
})
export class DynamicContentViewer {
  private hostElement: HTMLElement;
  private embeddedComponentFactories: Map<string, ComponentFactory<any>> = new Map();
  private embeddedComponents: ComponentRef<any>[] = [];

  @Input()
  data: any;

  @Output()
  docRendered = new EventEmitter();

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    elementRef: ElementRef,
    @Inject(EMBEDDABLE_COMPONENT) embeddedComponents: Array<Type<any>>,
    private injector: Injector,
    ) {
    this.hostElement = elementRef.nativeElement;
    embeddedComponents.forEach(component =>{
      const factory = componentFactoryResolver.resolveComponentFactory(component);
      this.embeddedComponentFactories.set(factory.selector, factory);
    })
  }

  @Input()
  set content(content) {
    this.ngOnDestroy();
    if (content) {
      this.build(content);
      this.docRendered.emit();
    }
  }

  private build(content) {
    this.hostElement.innerHTML = content || '';

    if (!content) { return; }

    this.embeddedComponentFactories.forEach((factory, selector) => {
      const embeddedComponentElements = this.hostElement.querySelectorAll(selector);
      embeddedComponentElements.forEach(element => {
        //convert NodeList into an array, since Angular dosen't like having a NodeList passed
        //for projectableNodes
        const projectableNodes = [Array.prototype.slice.call(element.childNodes)]

        const embeddedComponent = factory.create(this.injector, projectableNodes, element)

        //apply inputs into the dynamic component
        //only static ones work here since this is the only time they're set
        for(const attr of (element as any).attributes){
          embeddedComponent.instance[attr.nodeName] = attr.nodeValue;
        }
        this.embeddedComponents.push(embeddedComponent);
      });
    });
  }

  ngDoCheck() {
    this.embeddedComponents.forEach(comp => comp.changeDetectorRef.detectChanges());
  }

  ngOnDestroy() {
    // destroy these components else there will be memory leaks
    this.embeddedComponents.forEach(comp => comp.destroy());
    this.embeddedComponents.length = 0;
  }
}
