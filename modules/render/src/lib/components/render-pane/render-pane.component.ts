import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild, ComponentFactoryResolver, forwardRef, ComponentRef, HostBinding, ElementRef, Renderer2, AfterContentInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormBuilder, Validator, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { ContentPlugin, ContentPluginManager } from 'content';
import { InlineContext } from 'context';
import { PaneContentHostDirective } from '../../directives/pane-content-host.directive';
import { PanelPage, Pane, PanelContentHandler, PanelPageState, PageBuilderFacade, PaneStateService, CssHelperService } from 'panels';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { delay, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { JSONNode } from 'cssjson';
import { EntityCollectionService, EntityServices } from '@ngrx/data';
// import { PanelsContextService } from '../../services/panels-context.service';
// import { PageBuilderFacade } from '../../features/page-builder/page-builder.facade';
// import { FormService } from '../../services/form.service';
// import { PanelPageForm } from '../../models/form.models';

@Component({
  selector: 'classifieds-ui-render-pane',
  templateUrl: './render-pane.component.html',
  styleUrls: ['./render-pane.component.scss'],
  // encapsulation: ViewEncapsulation.ShadowDom,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RenderPaneComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RenderPaneComponent),
      multi: true
    }
  ],
  host: {
    '[class.pane]': 'true',
    '[attr.data-index]': 'indexPosition'
  }
})
export class RenderPaneComponent implements OnInit, OnChanges, ControlValueAccessor, Validator, AfterContentInit {

  @Input()
  pluginName: string;

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  linkedPageId: string;

  @Input()
  contexts: Array<InlineContext>;

  @Input()
  originPane: Pane;

  @Input()
  displayType: string;

  @Input()
  name: string;

  @Input()
  label: string;

  @Input()
  indexPosition: number;

  @Input()
  ancestory: Array<number> = [];

  @Input()
  resolvedContext = {};

  @Input()
  panes: Array<Pane> = [];

  @Input()
  originPanes: Array<Pane> = [];

  @Input() set css(css: JSONNode) {
    this.css$.next(css);
  }

  @HostBinding('class') get indexPositionClass() {
    return `pane-${this.indexPosition}`;
  } 

  readonly afterContentInit$ = new Subject();
  private schedulePluginChange = new Subject();

  contentPlugin: ContentPlugin;
 
  panelPage: PanelPage;

  ancestoryWithSelf: Array<number> = [];

  componentRef: ComponentRef<any>;

  filteredCss: JSONNode;

  css$ = new BehaviorSubject<JSONNode>(this.cssHelper.makeJsonNode());
  cssSub = combineLatest([
    this.css$,
    this.afterContentInit$,
    // this.schedulePluginChange
  ]).pipe(
    map(([css]) => css),
    map((css: JSONNode) => this.cssHelper.reduceCss(css, `.pane-${this.indexPosition}`)),
    map((css: JSONNode) => [
      this.cssHelper.reduceCss(css, '.panel-page', false),
      this.cssHelper.reduceCss(css, '.panel-page')
    ]),
    tap(([_, nestedCss]) => this.filteredCss = nestedCss),
    map(([css, _]) => css),
    // delay(500)
  ).subscribe(css => {
    const keys = Object.keys(css.children);
    keys.forEach(k => {
      console.log(`search: ${k}`);
      const matchedNodes = k === '' ? [ this.el.nativeElement ] : this.el.nativeElement.querySelectorAll(k);
      const len = matchedNodes.length;
      const rules = Object.keys(css.children[k].attributes);
      for (let i = 0; i < len; i++) {
        rules.forEach(p => {
          console.log(`${k} { ${p}: ${css.children[k].attributes[p]}; }`);
          this.renderer2.setStyle(matchedNodes[i], p, css.children[k].attributes[p]);
        });
      }
    });
  });

  paneForm = this.fb.group({
    contentPlugin: this.fb.control('', Validators.required),
    name: this.fb.control(''),
    label: this.fb.control(''),
    settings: this.fb.control('')
  });

  paneFormSub = this.paneForm.valueChanges.subscribe(v => {
    console.log(`pane form value plugin: ${this.pluginName}`);
    console.log(v);
  });

  private panelPageStateService: EntityCollectionService<PanelPageState>;

  scheduleStateChange$ = new Subject<{ state: any }>();

  scheduleStateChangeSub = this.scheduleStateChange$.pipe(
    switchMap(({ state }) => this.paneStateService.mergeState({ state, ancestory: [ ...this.ancestoryWithSelf ], settings: this.settings, plugin: this.contentPlugin }))
  ).subscribe(({ pageState }) => {
    this.panelPageStateService.upsert(pageState);
  });

  public onTouched: () => void = () => {};

  // private contentPlugins: Array<ContentPlugin> = [];

  private pluginChangeSub = this.schedulePluginChange.pipe(
    filter(() => this.pluginName && this.pluginName !== null && this.pluginName !== ''),
    switchMap(() => this.cpm.getPlugin(this.pluginName))
  ).subscribe(p => {
    this.contentPlugin = p;
    this.paneForm.get('contentPlugin').setValue(p.name);
    this.paneForm.get('name').setValue(this.name);
    this.paneForm.get('label').setValue(this.label);
    if(this.pluginName === 'panel') {
      //console.log('resolve nested panel page');
      this.resolveNestedPanelPage();
    } else {
      this.renderPaneContent();
    }
  });

  @ViewChild(PaneContentHostDirective, { static: true }) contentPaneHost: PaneContentHostDirective;

  constructor(
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    private el: ElementRef,
    private renderer2: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private panelHandler: PanelContentHandler,
    private fb: FormBuilder,
    private cpm: ContentPluginManager,
    private cssHelper: CssHelperService,
    private paneStateService: PaneStateService,
    es: EntityServices
  ) {
    this.panelPageStateService = es.getEntityCollectionService('PanelPageState');
    // this.contentPlugins = contentPlugins;
  }

  ngOnInit(): void {
    this.ancestoryWithSelf = [ ...(this.ancestory ? this.ancestory: []), ...( this.indexPosition !== undefined && this.indexPosition !== null? [ this.indexPosition ] : [] ) ];
    this.schedulePluginChange.next(undefined);
    /*this.contentPlugin = this.contentPlugins.find(p => p.name === this.pluginName);
    this.paneForm.get('contentPlugin').setValue(this.contentPlugin.name);
    this.paneForm.get('name').setValue(this.name);
    this.paneForm.get('label').setValue(this.label);
    if(this.pluginName === 'panel') {
      //console.log('resolve nested panel page');
      this.resolveNestedPanelPage();
    } else  {
      this.renderPaneContent();
    }*/
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ancestory || changes.indexPosition) {
      const ancestoryWithSelf = [ ...(changes.ancestory.currentValue ? changes.ancestory.currentValue :  this.ancestory ? this.ancestory : []), ...( changes.indexPosition.currentValue !== undefined && changes.indexPosition.currentValue !== null? [ changes.indexPosition.currentValue ] : this.indexPosition ? [ this.indexPosition ] : [] ) ];
      if (ancestoryWithSelf.length !== this.ancestoryWithSelf.length || this.ancestoryWithSelf.filter((n, index) => ancestoryWithSelf[index] !== n).length !== 0) {
        this.ancestoryWithSelf = ancestoryWithSelf;
      }
    }
    this.schedulePluginChange.next(undefined);
    /*this.contentPlugin = this.contentPlugins.find(p => p.name === this.pluginName);
    this.paneForm.get('contentPlugin').setValue(this.contentPlugin.name);
    this.paneForm.get('name').setValue(this.name);
    this.paneForm.get('label').setValue(this.label);
    if(this.pluginName === 'panel') {
      //console.log('resolve nested panel page');
      this.resolveNestedPanelPage();
    } else {
      this.renderPaneContent();
    }*/
  }

  ngAfterContentInit() {
    this.afterContentInit$.next(undefined);
  }

  writeValue(val: any): void {
    if (val) {
      this.paneForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.paneForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.paneForm.disable()
    } else {
      this.paneForm.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.paneForm.valid ? null : { invalidForm: {valid: false, message: "pane is invalid"}};
  }

  resolveNestedPanelPage() {
    this.panelHandler.toObject(this.settings).subscribe(p => {
      this.panelPage = new PanelPage({ ...p, contexts: this.contexts });
    });
  }

  renderPaneContent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.contentPlugin.renderComponent);

    const viewContainerRef = this.contentPaneHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent(componentFactory);
    (this.componentRef.instance as any).settings = this.settings;
    (this.componentRef.instance as any).name = this.name;
    (this.componentRef.instance as any).label = this.label;
    (this.componentRef.instance as any).panes = this.panes;
    (this.componentRef.instance as any).originPanes = this.originPanes;
    (this.componentRef.instance as any).contexts = this.contexts.map(c => new InlineContext(c));
    (this.componentRef.instance as any).displayType = this.displayType;
    (this.componentRef.instance as any).resolvedContext = this.resolvedContext;
    (this.componentRef.instance as any).ancestory = this.ancestoryWithSelf;

    if ((this.componentRef.instance as any).state && this.contentPlugin.handler) {
      this.contentPlugin.handler.stateDefinition(this.settings).pipe(
        take(1)
      ).subscribe(s => {
        (this.componentRef.instance as any).state = s ? s : {};
      });
    }

    if ((this.componentRef.instance as any).stateChange) {
      (this.componentRef.instance as any).stateChange.subscribe(state => {
        this.scheduleStateChange$.next({ state });
      });
    }

  }

}
