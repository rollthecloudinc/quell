import { Type, Component, NgModule, VERSION, Inject, ComponentFactoryResolver, InjectionToken,Injector, ElementRef, Output, Input, EventEmitter, ComponentFactory, ComponentRef, OnInit, AfterContentInit, SecurityContext} from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EMBEDDABLE_COMPONENT } from '../../utils.tokens';

@Component({
  selector: 'classifieds-ui-dynamic-content-viewer',
  template: `<div *ngIf="bypassSecurity" [innerHtml]="safeContent"></div>
             <div *ngIf="!bypassSecurity" [innerHtml]="unsafeContent"></div>`,
})
export class DynamicContentViewer implements OnInit, AfterContentInit {
  private hostElement: HTMLElement;
  private embeddedComponentFactories: Map<string, ComponentFactory<any>> = new Map();
  private embeddedComponents: ComponentRef<any>[] = [];

  @Input()
  data: any;

  @Input()
  content: string;

  @Input()
  bypassSecurity = false;

  @Output()
  docRendered = new EventEmitter();

  unsafeContent: string;
  safeContent: SafeHtml;

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    elementRef: ElementRef,
    @Inject(EMBEDDABLE_COMPONENT) embeddedComponents: Array<Type<any>>,
    private injector: Injector,
    private sanitizer: DomSanitizer
    ) {
    this.hostElement = elementRef.nativeElement;
    embeddedComponents.forEach(component =>{
      const factory = componentFactoryResolver.resolveComponentFactory(component);
      this.embeddedComponentFactories.set(factory.selector, factory);
    })
  }

  /*@Input()
  set content(content) {
    this.ngOnDestroy();
    if (content) {
      this.build(content);
      this.docRendered.emit();
    }
  }*/

  ngOnInit() {
    if(this.bypassSecurity) {
      this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
      this.unsafeContent = undefined;
    } else {
      this.safeContent = undefined;
      this.unsafeContent = this.content;
    }
  }

  ngAfterContentInit() {
    this.build();
  }

  private build() {

    if (!this.safeContent && !this.unsafeContent) { return; }

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
