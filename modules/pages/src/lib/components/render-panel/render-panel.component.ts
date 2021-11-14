import { Component, OnInit, Input, ComponentFactoryResolver, Inject, ViewChild, OnChanges, SimpleChanges, ElementRef, Output, EventEmitter, forwardRef, HostBinding, ViewEncapsulation, Renderer2, ViewChildren, QueryList, AfterViewInit, AfterContentInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormBuilder, Validator, AbstractControl, ValidationErrors, FormArray } from "@angular/forms";
import { Panel, Pane, PanelResolverService, StyleResolverService, StylePlugin, StylePluginManager } from 'panels';
import { CONTENT_PLUGIN, ContentPlugin } from 'content';
import { InlineContext } from 'context';
import { STYLE_PLUGIN } from 'style';
import { PaneContentHostDirective } from '../../directives/pane-content-host.directive';
import { switchMap, map, filter, debounceTime, tap, delay, takeUntil, startWith } from 'rxjs/operators';
import { Subscription, Subject, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { JSONNode } from 'cssjson';
import { CssHelperService } from '../../services/css-helper.service';
import { RenderPaneComponent } from '../render-pane/render-pane.component';

@Component({
  selector: 'classifieds-ui-render-panel',
  templateUrl: './render-panel.component.html',
  styleUrls: ['./render-panel.component.scss'],
  // encapsulation: ViewEncapsulation.ShadowDom,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RenderPanelComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RenderPanelComponent),
      multi: true
    },
  ],
  host: {
    '[class.panel]': 'true',
    '[attr.data-index]': 'indexPosition'
  }
})
export class RenderPanelComponent implements OnInit, AfterViewInit, AfterContentInit, OnChanges, ControlValueAccessor, Validator  {

  static COUNTER = 0;

  @Input()
  panel: Panel;

  @Input()
  contexts: Array<InlineContext>;

  @Input()
  nested = false;

  @Input()
  displayType: string;

  @Input()
  resolvedContext = {};

  @Input()
  set contextChanged(contextChanged: { name: string; }) {
    // this.schduleContextChange.next(contextChanged.name);
  }

  @Input()
  set contextsChanged(contextsChanged: Array<string>) {
    contextsChanged.map(c => this.schduleContextChange.next(c));
  }

  @Input()
  indexPosition: number;

  @Input()
  ancestory: Array<number> = [];

  @Input() set css(css: JSONNode) {
    this.css$.next(css);
  }

  @Output()
  heightChange = new EventEmitter<number>();

  @HostBinding('class') get indexPositionClass() {
    return `panel-${this.indexPosition}`;
  }

  @ViewChildren(RenderPaneComponent) renderedPanes: QueryList<RenderPaneComponent>;

  panelForm = this.fb.group({
    name: this.fb.control(''),
    label: this.fb.control(''),
    panes: this.fb.array([])
  });

  panelFormSub = this.panelForm.valueChanges.subscribe(v => {
    console.log('paneL form value');
    console.log(v);
  });

  panes: Array<Pane>;

  filteredCss: JSONNode;
  
  /*initialRenderComplete = setInterval(() => {
    console.log(`check pane initial render [${this.panel.name}]`);
    console.log(`expected: ${this.resolvedPanes !== undefined ? this.resolvedPanes.length : 'null'} | actual ${this.renderedPanes.length}`);
    if (this.resolvedPanes !== undefined && this.renderedPanes.length === this.resolvedPanes.length) {
      console.log(`COMPLETE: check pane initial render [${this.panel.name}]`);
      clearInterval(this.initialRenderComplete);
    }
  }, 250);*/

  afterContentInit$ = new Subject();
  schedulePanelRender = new Subject<string>();
  readonly rendered$ = new Subject();

  css$ = new BehaviorSubject<JSONNode>(this.cssHelper.makeJsonNode());
  cssSub = combineLatest([
    this.css$,
    this.afterContentInit$,
    this.rendered$
  ]).pipe(
    map(([css]) => css),
    map((css: JSONNode) => this.cssHelper.reduceCss(css, `.panel-${this.indexPosition}`)),
    map((css: JSONNode) => [
      this.cssHelper.reduceCss(css, '.pane-', false),
      css
    ]),
    tap(([_, nestedCss]) => this.filteredCss = nestedCss),
    map(([css, _]) => css),
    delay(1)
  ).subscribe((css: JSONNode) => {
    /*console.log(`matched css inside panel renderer: ${this.indexPosition}`);
    console.log(css);
    this.filteredCss = css;*/
    const keys = Object.keys(css.children);
    keys.forEach(k => {
      console.log(`search: ${k}`);
      const matchedNodes = k === '' ? [ this.hostEl.nativeElement ] : this.hostEl.nativeElement.querySelectorAll(k);
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

  scheduleRender = new Subject<[Array<Pane>, Array<InlineContext>, any]>();
  scheduleRenderSub = this.scheduleRender.pipe(
    tap(() => console.log(`schdule renderer before [${this.panel.name}]`)),
    switchMap(([panes, contexts, resolvedContext]) => this.panelResolverService.resolvePanes({ panes, contexts, resolvedContext })),
    switchMap(({ resolvedPanes, originMappings/*, resolvedContexts */ }) => this.styleResolverService.alterResolvedPanes({ panel: this.panel, resolvedPanes, originMappings /*, resolvedContexts */ })),
    tap(() => console.log(`schdule renderer after [${this.panel.name}]`)),
  ).subscribe(({ resolvedPanes, originMappings/*, resolvedContexts*/ }) => {
    console.log(`render panel: ${this.panel.name}`);
    this.resolvedPanes = resolvedPanes;
    this.originMappings = originMappings;
    // this.resolvedContexts = resolvedContexts;
    if(this.paneContainer && this.stylePlugin === undefined) {
      // setTimeout(() => this.heightChange.emit(this.paneContainer.nativeElement.offsetHeight));
    }
    this.populatePanesFormArray();
    if(this.stylePlugin !== undefined) {
      this.renderPanelContent();
    } else {
      this.rendered$.next();
    }

    // clearInterval(this.initialRenderComplete);
  });

  schduleContextChangeSub: Subscription;
  schduleContextChange = new Subject<string>();

  schedulePanelRenderSub = this.schedulePanelRender.pipe(
    switchMap(p => this.spm.getPlugin(p))
  ).subscribe(stylePlugin => {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(stylePlugin.renderComponent);

    const viewContainerRef = this.panelHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as any).settings = this.panel.settings;
    (componentRef.instance as any).panes = this.resolvedPanes;
    (componentRef.instance as any).originPanes = this.panel.panes;
    (componentRef.instance as any).originMappings = this.originMappings;
    (componentRef.instance as any).contexts = this.contexts.map(c => new InlineContext(c));
    (componentRef.instance as any).displayType = this.displayType;
    (componentRef.instance as any).ancestory = this.ancestoryWithSelf;
    // (componentRef.instance as any).resolvedContexts = this.resolvedContexts;
    (componentRef.instance as any).resolvedContext = this.resolvedContext;
    (componentRef.instance as any).panel = this.panel;

    this.rendered$.next();
  });

  resolvedPanes: Array<Pane>;
  originMappings: Array<number> = [];
  resolvedContexts: Array<any> = [];
  ancestoryWithSelf: Array<number> = [];

  resolveContextsSub: Subscription;

  // stylePlugins: Array<StylePlugin> = [];
  stylePlugin: string;

  // contentPlugins: Array<ContentPlugin> = [];

  public onTouched: () => void = () => {};

  private counter: number;

  @ViewChild(PaneContentHostDirective, { static: true }) panelHost: PaneContentHostDirective;
  @ViewChild('panes', { static: true }) paneContainer: ElementRef;

  get panesArray(): FormArray {
    return this.panelForm.get('panes') as FormArray;
  }

  constructor(
    // @Inject(STYLE_PLUGIN) stylePlugins: Array<StylePlugin>,
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    private hostEl: ElementRef,
    private renderer2: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private fb: FormBuilder,
    private panelResolverService: PanelResolverService,
    private spm: StylePluginManager,
    private cssHelper: CssHelperService,
    private styleResolverService: StyleResolverService
  ) {
    this.counter = RenderPanelComponent.COUNTER++;
    // this.stylePlugins = stylePlugins;
    // this.contentPlugins = contentPlugins;
  }

  ngOnInit(): void {
    this.stylePlugin = this.panel.stylePlugin !== undefined && this.panel.stylePlugin !== '' ? this.panel.stylePlugin : undefined; // this.stylePlugins.find(p => p.name === this.panel.stylePlugin) : undefined;
    if(this.panel !== undefined && this.panelHost !== undefined) {
      console.log(`panel render init [${this.panel.name}`);
      this.panelResolverService.usedContexts(this.panel.panes).pipe(
        map(ctx => ctx.filter(c => c !== '_page' && c !== '_root' && c !== '.' && c.indexOf('panestate-' + this.ancestoryWithSelf.join('-')) !== 0)),
        tap(ctx => console.log(`contexts [${this.panel.name}]: ${ctx.join(',')}`)),
        switchMap(ctx => this.schduleContextChange.pipe(
          tap(contextChanged => console.log(`detected change [${this.panel.name}]: ${contextChanged}`)),
          map(contextChanged =>  [ctx, contextChanged ])
          // @todo: Replacing the line above with the one below causes an infinite context change loop on the ad browser use case. no good.
          // I think this line was being used for the pane state detection since there was an issue with it. However, that is not being use anymore.
          // map(contextChanged => [ctx.includes(contextChanged) ? ctx : [ ...ctx, contextChanged ], contextChanged]) // This might be a breaking change but I do know some of this was never very well tested... :/
        )),
        tap(([ctx, contextChanged]) => console.log(`detected change [${this.panel.name}]: ${contextChanged} : ctx: ${(ctx as Array<string>).join(',')}`)),
        filter(([ctx, contextChanged]) => Array.isArray(ctx) && ctx.findIndex(c => c === contextChanged) !== -1),
        debounceTime(100)
      ).subscribe(([ctx, contextChanged]) => {
        console.log(`Context changed [${this.panel.name}]: ${contextChanged}`);
        console.log(`contexts detected [${this.panel.name}]: ${(ctx as Array<string>).join(',')}`);
        this.scheduleRender.next([this.panel.panes, this.contexts, this.resolvedContext]);
      });
    }
    this.ancestoryWithSelf = [ ...(this.ancestory ? this.ancestory: []), ...( this.indexPosition !== undefined && this.indexPosition !== null? [ this.indexPosition ] : [] ) ];
  }

  ngOnChanges(changes: SimpleChanges) {
    //console.log(`ngOnChanges render panel [${this.panel.name}]`);
    //console.log(changes);
    this.stylePlugin = this.panel.stylePlugin !== undefined && this.panel.stylePlugin !== '' ? this.panel.stylePlugin : undefined; // this.stylePlugins.find(p => p.name === this.panel.stylePlugin) : undefined;
    if(changes.resolvedContext && changes.resolvedContext.previousValue === undefined) {
      this.scheduleRender.next([this.panel.panes, this.contexts, this.resolvedContext]);
    }
    /*if(changes.contextChanged && changes.contextChanged.currentValue !== undefined) {
      this.schduleContextChange.next(changes.contextChanged.currentValue.name);
    }*/
    if (changes.ancestory || changes.indexPosition) {
      const ancestoryWithSelf = [ ...(changes.ancestory.currentValue ? changes.ancestory.currentValue :  this.ancestory ? this.ancestory : []), ...( changes.indexPosition.currentValue !== undefined && changes.indexPosition.currentValue !== null? [ changes.indexPosition.currentValue ] : this.indexPosition ? [ this.indexPosition ] : [] ) ];
      if (ancestoryWithSelf.length !== this.ancestoryWithSelf.length || this.ancestoryWithSelf.filter((n, index) => ancestoryWithSelf[index] !== n).length !== 0) {
        this.ancestoryWithSelf = ancestoryWithSelf;
      }
    }
  }

  ngAfterViewInit() {
  }

  ngAfterContentInit() {
    this.afterContentInit$.next();
  }

  writeValue(val: any): void {
    if (val) {
      this.panelForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.panelForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.panelForm.disable()
    } else {
      this.panelForm.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.panelForm.valid ? null : { invalidForm: {valid: false, message: "panel are invalid"}};
  }

  populatePanesFormArray() {
    this.panesArray.clear();
    this.resolvedPanes.forEach((p, i) => {
      this.panesArray.push(this.fb.control(''));
    });
  }

  renderPanelContent() {
    this.schedulePanelRender.next(this.stylePlugin);
  }

}
