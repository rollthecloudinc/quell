import { Component, OnInit, Input, ComponentFactoryResolver, Inject, ViewChild, OnChanges, SimpleChanges, ElementRef, Output, EventEmitter, forwardRef, HostBinding, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormBuilder, Validator, AbstractControl, ValidationErrors, FormArray } from "@angular/forms";
import { Panel, Pane } from 'panels';
import { CONTENT_PLUGIN, ContentPlugin } from 'content';
import { InlineContext } from 'context';
import { STYLE_PLUGIN, StylePlugin, StylePluginManager } from 'style';
import { PaneContentHostDirective } from '../../directives/pane-content-host.directive';
import { switchMap, map, filter, debounceTime, tap } from 'rxjs/operators';
import { Subscription, Subject, BehaviorSubject } from 'rxjs';
import { PanelResolverService } from '../../services/panel-resolver.service';
import { JSONNode } from 'cssjson';
import { CssHelperService } from '../../services/css-helper.service';

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
export class RenderPanelComponent implements OnInit, OnChanges, ControlValueAccessor, Validator  {

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
  contextChanged: { name: string; };

  @Input()
  indexPosition: number;

  @Input() set css(css: JSONNode) {
    this.css$.next(css);
  }

  @Output()
  heightChange = new EventEmitter<number>();

  @HostBinding('class') get indexPositionClass() {
    return `panel-${this.indexPosition}`;
  }

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

  css$ = new BehaviorSubject<JSONNode>(this.cssHelper.makeJsonNode());
  cssSub = this.css$.pipe(
    map((css: JSONNode) => this.cssHelper.reduceCss(css, `.panel-${this.indexPosition}`))
  ).subscribe((css: JSONNode) => {
    this.filteredCss = css;
  });

  scheduleRender = new Subject<[Array<Pane>, Array<InlineContext>, any]>();
  scheduleRenderSub = this.scheduleRender.pipe(
    tap(() => console.log(`schdule renderer before [${this.panel.name}]`)),
    switchMap(([panes, contexts, resolvedContext]) => this.panelResolverService.resolvePanes(panes, contexts, resolvedContext)),
    tap(() => console.log(`schdule renderer after [${this.panel.name}]`)),
  ).subscribe(([resolvedPanes, originMappings, resolvedContexts]) => {
    console.log(`render panel: ${this.panel.name}`);
    this.resolvedPanes = resolvedPanes;
    this.originMappings = originMappings;
    this.resolvedContexts = resolvedContexts;
    if(this.paneContainer && this.stylePlugin === undefined) {
      setTimeout(() => this.heightChange.emit(this.paneContainer.nativeElement.offsetHeight));
    }
    this.populatePanesFormArray();
    if(this.stylePlugin !== undefined) {
      this.renderPanelContent();
    }
  });

  schduleContextChangeSub: Subscription;
  schduleContextChange = new Subject<string>();

  schedulePanelRender = new Subject<string>();
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
  });

  resolvedPanes: Array<Pane>;
  originMappings: Array<number> = [];
  resolvedContexts: Array<any> = [];

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
    private componentFactoryResolver: ComponentFactoryResolver,
    private fb: FormBuilder,
    private panelResolverService: PanelResolverService,
    private spm: StylePluginManager,
    private cssHelper: CssHelperService
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
        map(ctx => ctx.filter(c => c !== '_page' && c !== '_root' && c !== '.')),
        tap(ctx => console.log(`contexts [${this.panel.name}]: ${ctx.join(',')}`)),
        switchMap(ctx => this.schduleContextChange.pipe(
          tap(contextChanged => console.log(`detected change [${this.panel.name}]: ${contextChanged}`)),
          map(contextChanged => [ctx, contextChanged])
        )),
        tap(([ctx, contextChanged]) => console.log(`detected change [${this.panel.name}]: ${contextChanged} : ctx: ${(ctx as Array<string>).join('.')}`)),
        filter(([ctx, contextChanged]) => Array.isArray(ctx) && ctx.findIndex(c => c === contextChanged) !== -1),
        debounceTime(100)
      ).subscribe(([ctx, contextChanged]) => {
        console.log(`Context changed [${this.panel.name}]: ${contextChanged}`);
        console.log(`contexts detected [${this.panel.name}]: ${(ctx as Array<string>).join('.')}`);
        this.scheduleRender.next([this.panel.panes, this.contexts, this.resolvedContext]);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    //console.log(`ngOnChanges render panel [${this.panel.name}]`);
    //console.log(changes);
    this.stylePlugin = this.panel.stylePlugin !== undefined && this.panel.stylePlugin !== '' ? this.panel.stylePlugin : undefined; // this.stylePlugins.find(p => p.name === this.panel.stylePlugin) : undefined;
    if(changes.resolvedContext && changes.resolvedContext.previousValue === undefined) {
      this.scheduleRender.next([this.panel.panes, this.contexts, this.resolvedContext]);
    }
    if(changes.contextChanged && changes.contextChanged.currentValue !== undefined) {
      this.schduleContextChange.next(changes.contextChanged.currentValue.name);
    }
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
