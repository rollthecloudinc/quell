import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges, ElementRef, Inject, TemplateRef, ComponentFactoryResolver, ComponentRef, AfterViewInit, ViewEncapsulation, forwardRef, HostBinding, AfterContentInit, Renderer2, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, ControlValueAccessor, Validator, NG_VALIDATORS, NG_VALUE_ACCESSOR, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EntityServices, EntityCollectionService, EntityCollection } from '@ngrx/data';
import { CONTENT_PLUGIN, ContentPlugin, ContentPluginManager } from 'content';
import { GridLayoutComponent, LayoutPluginManager } from 'layout';
import { AsyncApiCallHelperService, StyleLoaderService } from 'utils';
import { /*ContextManagerService, */ InlineContext, ContextPluginManager, InlineContextResolverService } from 'context';
import { PanelPage, Pane, LayoutSetting, CssHelperService, PanelsContextService, PageBuilderFacade, FormService, PanelPageForm, PanelPageState, PanelContentHandler, PaneStateService, Panel, StylePlugin, PanelResolverService, StylePluginManager, StyleResolverService } from 'panels';
import { DisplayGrid, GridsterConfig, GridType, GridsterItem } from 'angular-gridster2';
import { fromEvent, Subscription, BehaviorSubject, Subject, iif, of, forkJoin, Observable, combineLatest } from 'rxjs';
import { filter, tap, debounceTime, take, skip, scan, delay, switchMap, map, bufferTime } from 'rxjs/operators';
import { getSelectors, RouterReducerState } from '@ngrx/router-store';
import { Store, select, createSelector } from '@ngrx/store';
import { LayoutRendererHostDirective } from '../../directives/layout-renderer-host.directive';
import * as uuid from 'uuid';
import * as cssSelect from 'css-select';
import { JSONNode } from 'cssjson';
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { PaneContentHostDirective } from '../../directives/pane-content-host.directive';

@Component({
  selector: 'classifieds-ui-panel-page',
  templateUrl: './panel-page.component.html',
  styleUrls: ['./panel-page.component.scss'],
  // encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.panel-page]': 'true'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PanelPageComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PanelPageComponent),
      multi: true
    },
  ]
})
export class PanelPageComponent implements OnInit, OnChanges, AfterViewInit, ControlValueAccessor, Validator {

  @Input()
  id: string;

  @Input()
  panelPage: PanelPage;

  @Input()
  nested = false;

  @Input()
  contexts: Array<InlineContext> = [];
  /*@Input()
  set contexts(contexts: Array<InlineContext>) {
    this.contexts$.next(contexts);
  }
  get contexts(): Array<InlineContext> {
    return this.contexts$.value;
  }*/

  @Input()
  ancestory: Array<number> = [];

  @Input() set css(css: JSONNode) {
    this.css$.next(css);
  }

  /*@Input()
  set resolvedContext(resolvedContext: any) {
    this.resolvedContext$.next(resolvedContext);
  }
  get resolvedContexts(): any {
    return this.resolvedContext$.value;
  }*/
  @Input()
  resolvedContext = {};

  contextChanged: { name: string };
  contextsChanged: Array<string> = [];
  layoutRendererRef: ComponentRef<any>;
  //contexts$ = new BehaviorSubject<Array<InlineContext>>([]);
  //resolvedContext$ = new BehaviorSubject<any>({});

  filteredCss: JSONNode;

  css$ = new BehaviorSubject<JSONNode>(this.cssHelper.makeJsonNode());
  cssSub = this.css$.subscribe(css => {
    this.filteredCss = css;
  });

  settingsFormArray = this.fb.array([]);
  pageForm = this.fb.group({
    /*name: this.fb.control(''),
    title: this.fb.control(''),
    derivativeId: this.fb.control(''),*/
    panels: this.fb.array([])
  });

  resolveSub: Subscription;

  options: GridsterConfig = {
    gridType: GridType.Fit,
    displayGrid: DisplayGrid.None,
    pushItems: false,
    draggable: {
      enabled: false
    },
    resizable: {
      enabled: false
    },
    mobileBreakpoint: 0
  };

  // private contentPlugins: Array<ContentPlugin> = [];

  private panelPageService: EntityCollectionService<PanelPage>;
  private panelPageFormService: EntityCollectionService<PanelPageForm>;
  private panelPageStateService: EntityCollectionService<PanelPageState>;

  private schedulePageFetch = new Subject();
  private pageFetchSub = this.schedulePageFetch.pipe(
    tap(() => console.log('schedue page fetch')),
    switchMap(() => /*this.asyncApiCallHelperSvc.doTask(*/this.panelPageService.getByKey(this.id).toPromise()/*)*/),
    switchMap(p =>
      this.cpm.getPlugins(
        p.panels.reduce<Array<string>>((contentPlugins, c) => {
          c.panes.forEach(pane => {
            if(!contentPlugins.includes(pane.contentPlugin)) {
              contentPlugins.push(pane.contentPlugin);
            }
          });
          return contentPlugins;
        }, [])
      ).pipe(
        map<Map<string, ContentPlugin>, [PanelPage, boolean]>(contentPlugins => [p, p.panels.reduce<Array<Pane>>((panes, panel) => [ ...panes, ...panel.panes ], []).map(pane => contentPlugins.get(pane.contentPlugin).handler?.isDynamic(pane.settings) ).findIndex(d => d === true) !== -1])
      )
    ),
    // This breaks adbrowser because it results in infinite recursion :(
    switchMap(([p, isDynamic]) => iif<[PanelPage, boolean, Array<InlineContext>], [PanelPage, boolean, Iterable<InlineContext>]>(
      () => !this.nested,
      /*!this.nested ? this.panelsContextService.allActivePageContexts({ panelPage: p }).pipe(
        map(paneContexts => [p, isDynamic, paneContexts])
      ): of([p, isDynamic, []]),*/
      this.panelsContextService.allActivePageContexts({ panelPage: p }).pipe(
        map(paneContexts => [p, isDynamic, Array.from(paneContexts)])
      ),
      of([p, isDynamic, []])
    ))
    // placeholder for now...
    // map<[PanelPage, boolean], [PanelPage, boolean, Array<InlineContext>]>(([p, isDynamic]) => [p, isDynamic,[]])
  ).subscribe(([p, isDynamic, paneContexts]) => {
    this.contexts = [ ...(p.contexts ? p.contexts.map(c => new InlineContext(c)) : []), ...paneContexts ];
    this.panelPage = p;
    this.populatePanelsFormArray();
    if(!this.nested || isDynamic ) {
      this.hookupContextChange();
    }
    if (p.layoutType === 'gridless' || p.layoutType === 'split') {
      this.renderLayoutRenderer(p.layoutType);
    } else {
      const viewContainerRef = this.layoutRendererHost.viewContainerRef;
      viewContainerRef.clear();
    }
    if (p.cssFile && p.cssFile.trim() !== '') {
      this.experimentalApplyCss(p.cssFile.trim());
    }
    this.experimentalApplyJs();
  });

  bridgeSub = this.pageForm.valueChanges.pipe(
    filter(() => this.nested),
    debounceTime(500)
  ).subscribe(v => {
    console.log('write page');
    console.log(v);
    this.settingsFormArray.clear();
    const newGroup = this.attributeSerializer.convertToGroup(this.attributeSerializer.serialize(v, 'value').attributes[0]);
    this.settingsFormArray.push(newGroup);
    console.log(newGroup.value);
  });

  /*scheduleContextChangeSub = combineLatest([
    this.contexts$,
    this.resolvedContext$
  ]).subscribe(() => {
    this.hookupContextChange();
  });*/

  @ViewChild(GridLayoutComponent, {static: false}) gridLayout: GridLayoutComponent;
  @ViewChild('renderPanelTpl', { static: true }) renderPanelTpl: TemplateRef<any>;
  @ViewChild(LayoutRendererHostDirective, { static: false }) layoutRendererHost: LayoutRendererHostDirective;

  get panelsArray(): FormArray {
    return this.pageForm.get('panels') as FormArray;
  }

  get columnSettings(): Array<LayoutSetting> {
    const settings = this.panelPage ? this.panelPage.panels.reduce<Array<LayoutSetting>>((p, c) => [ ...p, new LayoutSetting(c.columnSetting) ], []) : [];
    return settings;
  }

  /*get pageIsDynamic() {
    return this.panelPage.panels.reduce<Array<[Pane, ContentPlugin]>>((p2, c) => [ ...p2, ...c.panes.map<[Pane, ContentPlugin]>(p3 => [p3, this.contentPlugins.find(cp => cp.name === p3.contentPlugin)]) ], []).find(([p2, cp]) => cp.handler && cp.handler.isDynamic(p2.settings)) !== undefined;
  }*/

  public onTouched: () => void = () => {};

  constructor(
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    private routerStore: Store<RouterReducerState>,
    private fb: FormBuilder,
    private el: ElementRef,
    private inlineContextResolver: InlineContextResolverService,
    // private contextManager: ContextManagerService,
    private pageBuilderFacade:PageBuilderFacade,
    private cpm: ContentPluginManager,
    private cxm: ContextPluginManager,
    private lpm: LayoutPluginManager,
    private componentFactoryResolver: ComponentFactoryResolver,
    private styleLoader: StyleLoaderService,
    // I don't feel good about this but f**k it for now til I figure this out
    private http: HttpClient,
    private cssHelper: CssHelperService,
    private attributeSerializer: AttributeSerializerService,
    private formService: FormService,
    private panelsContextService: PanelsContextService,
    private asyncApiCallHelperSvc: AsyncApiCallHelperService,
    es: EntityServices,
  ) {
    console.log('panel page constructor');
    // this.contentPlugins = contentPlugins;
    this.panelPageService = es.getEntityCollectionService('PanelPage');
    this.panelPageFormService = es.getEntityCollectionService('PanelPageForm');
    this.panelPageStateService = es.getEntityCollectionService('PanelPageState');
  }

  ngOnInit(): void {
    console.log('panel page init');
    /*if(!this.nested) {
      console.log('hookup');
      const nav$ = fromEvent(this.el.nativeElement, 'click').pipe(
        //filter(evt => (evt as any).target.closest('a') !== null),
        tap(() => alert('Hello'))
      );
    }*/
    // this.styleLoader.loadStyle('https://80ry0dd5s4.execute-api.us-east-1.amazonaws.com/media/test.css');
    this.pageForm.valueChanges.pipe(
      debounceTime(100),
      filter(() => this.panelPage !== undefined && this.panelPage.displayType === 'form'),
      tap(() => console.log('page form value change'))
    ).subscribe(v => {
      const form = new PanelPageForm({ ...v, name: this.panelPage.name, title: this.panelPage.title, derivativeId: this.panelPage.id});
      this.pageBuilderFacade.setForm(this.panelPage.name, form);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('panel page changes');
    if (this.nested) {
      console.log('panel page on changes');
      console.log(changes);
    }
    if(!this.nested && !changes.id.firstChange && changes.id.previousValue !== changes.id.currentValue) {
      // this.fetchPage();
      console.log(`fetch page`);
      this.schedulePageFetch.next(undefined);
    }
    if (this.layoutRendererRef && changes.panelPage && changes.panelPage.currentValue !== changes.panelPage.previousValue) {
      console.log(`assign panel page to renderer ref - passthur`);
      //(this.layoutRendererRef.instance as any).panelPage = this.panelPage;
      // This stuff below breaks the _page links on the character browser but fixes the _page when nested.
      this.populatePanelsFormArray();
      this.renderLayoutRenderer(this.panelPage.layoutType);
      this.hookupContextChange();
    }
  }

  ngAfterViewInit() {
    console.log('panel page after view init');
    if(this.id !== undefined) {
      // this.fetchPage();
      console.log('panel page view init schedulePageFetch.next()');
      this.schedulePageFetch.next(undefined);
    } else if(this.panelPage !== undefined) {
      console.log('populate from array');
      this.populatePanelsFormArray();
    }
    if (this.nested && this.id === undefined && this.panelPage) {
      this.renderLayoutRenderer(this.panelPage.layoutType);
    }
    if(!this.nested) {
      const { selectCurrentRoute } = getSelectors((state: any) => state.router);
      this.routerStore.pipe(
        select(selectCurrentRoute),
        filter(() => this.panelPage !== undefined)
      ).subscribe(route => {
          //this.panelPage = new PanelPage({ ...this.panelPage });
      });
    }
    if(this.nested && this.id === undefined) {
      this.hookupContextChange();
    }
  }

  /*fetchPage() {
    this.panelPageService.getByKey(this.id).subscribe(p => {
      /*if(this.nested) {
        this.contexts =
      } else {
        this.contexts = [];
      }*/
      /*console.log(p);
      this.contexts = p.contexts ? p.contexts.map(c => new InlineContext(c)) : [];
      this.panelPage = p;
      this.populatePanelsFormArray();

      if(!this.nested || this.pageIsDynamic ) {
        this.hookupContextChange();
      }
    });
  }*/

  onHeightChange(height: number, index: number) {
    this.gridLayout.setItemContentHeight(index, height);
  }

  populatePanelsFormArray() {
    this.panelsArray.clear();
    this.panelPage.panels.forEach((p, i) => {
      this.panelsArray.push(this.fb.control(''));
    });
  }

  hookupContextChange() {
    if(this.resolveSub !== undefined) {
      this.resolveSub.unsubscribe();
    }
    this.inlineContextResolver.resolveMerged(this.contexts, `panelpage:${uuid.v4()}`).pipe(
      // map(resolvedContext => ({ ...this.resolvedContext, ...resolvedContext })),
      switchMap(resolvedContext => this.cxm.getPlugins().pipe(
        map(plugins => [resolvedContext, Array.from(plugins.values()).filter(p => p.global === true)])
      )),
      take(1)
    ).subscribe(([resolvedContext, globalPlugins]) => {
      this.resolvedContext = resolvedContext;
      console.log(this.resolvedContext);
      this.resolveSub = this.inlineContextResolver.resolveMergedSingle(this.contexts).pipe(
        skip(globalPlugins.length + (this.contexts ? this.contexts.length : 0)),
        //tap(() => setTimeout(() => this.contextsChanged = []))
        bufferTime(1)
      ).subscribe(/*([cName, cValue])*/buffered => {
        //console.log(`context changed [${this.panelPage.name}]: ${cName}`);
        //this.contextChanged = { name: cName };
        //this.contextsChanged = [ ...this.contextsChanged, cName ];
        this.contextsChanged = buffered.reduce((p, [cName, _]) => [ ...p, ...(p.includes(cName) ? [] : [cName]) ], []);
        // this.resolvedContext = { ...this.resolvedContext, [cName]: cValue };
        this.resolvedContext = buffered.reduce((p, [cName, cValue]) => ({ ...p, [cName]: cValue }), this.resolvedContext);
      });
    });
  }

  submit() {
    const panelPageForm = new PanelPageForm({ ...this.pageForm.value, id: uuid.v4() });
    console.log(panelPageForm);
    console.log(this.formService.serializeForm(panelPageForm));
    this.panelPageFormService.add(panelPageForm).subscribe(() => {
      alert('panel page form added!');
    });


    // Currently PanelPageState ONLY uses the cache because noop data service is used. That has to change...
    // Experimental only - state forms
    /*const selectEntities = (entities: EntityCollection<PanelPageState>) => entities.entities;
    const selectById = ({ id }: { id: string }) => createSelector(
      selectEntities,
      entities => entities[id] ? entities[id] : undefined
    );
    this.pageBuilderFacade.getPageInfo$.pipe(
      tap(p => {
        console.log('page info', p);
        // console.log('panel page as form', new PanelPageForm({ panels: this.panelPage.panels.map() }));
      }),
      switchMap(p => this.panelPageStateService.collection$.pipe(
        select(selectById({ id: p.id }))
      )),
      tap(s => {
        console.log('panel page state', s);
      })
    ).subscribe();*/

  }

  renderLayoutRenderer(layout: string) {

    console.log(`render layout ${layout}`);

    this.lpm.getPlugin(layout).pipe(
      delay(1)
    ).subscribe(p => {

      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(p.renderer);

      const viewContainerRef = this.layoutRendererHost.viewContainerRef;
      viewContainerRef.clear();
  
      this.layoutRendererRef = viewContainerRef.createComponent(componentFactory);
      (this.layoutRendererRef.instance as any).renderPanelTpl = this.renderPanelTpl;
      (this.layoutRendererRef.instance as any).panelPage = this.panelPage;

    });

  }

  experimentalApplyCss(cssFile: string) {

    this.http.get<JSONNode>(cssFile).subscribe(css => {
      this.filteredCss = css;
    });

  }

  experimentalApplyJs() {
    //if (!this.nested) {
      /*const src = 'https://80ry0dd5s4.execute-api.us-east-1.amazonaws.com/media/bridge-test-12.js';
      let script = document.createElement('script') as HTMLScriptElement;
      script.type = 'text/javascript';
      script.src = src;
      document.getElementsByTagName('head')[0].appendChild(script);*/
    //}
  }

  writeValue(val: any): void {
    if (val) {
      this.settingsFormArray.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.settingsFormArray.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.settingsFormArray.disable()
    } else {
      this.settingsFormArray.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.settingsFormArray.valid ? null : { invalidForm: {valid: false, message: "content is invalid"}};
  }

}

/**
 * Putting render pane inside the same file is a documented work around for the
 * below angular partial compilation issue.
 * 
 * https://angular.io/errors/NG3003
 */
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

/**
 * Putting render pane inside the same file is a documented work around for the
 * below angular partial compilation issue.
 * 
 * https://angular.io/errors/NG3003
 */
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
    '[attr.data-index]': 'indexPosition$.value'
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
  set indexPosition(indexPosition: number) {
    this.indexPosition$.next(indexPosition);
  }

  @Input()
  set ancestory(ancestory: Array<number>) {
    this.ancestory$.next(ancestory);
  }

  @Input() set css(css: JSONNode) {
    this.css$.next(css);
  }

  @Output()
  heightChange = new EventEmitter<number>();

  @HostBinding('class') get indexPositionClass() {
    return `panel-${this.indexPosition$.value}`;
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
  originPanes: Array<Pane>;

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
  componentRef: ComponentRef<any>;
  readonly rendered$ = new Subject();

  css$ = new BehaviorSubject<JSONNode>(this.cssHelper.makeJsonNode());
  cssSub = combineLatest([
    this.css$,
    this.afterContentInit$,
    this.rendered$
  ]).pipe(
    map(([css]) => css),
    map((css: JSONNode) => this.cssHelper.reduceCss(css, `.panel-${this.indexPosition$.value}`)),
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
    switchMap(([panes, contexts, resolvedContext]) => this.panelResolverService.resolvePanes({ panes, contexts, resolvedContext }).pipe(
      map(({ resolvedPanes, originMappings/*, resolvedContexts */ }) => ({ resolvedPanes, originMappings, panes }))
    )),
    switchMap(({ panes, resolvedPanes, originMappings/*, resolvedContexts */ }) => this.styleResolverService.alterResolvedPanes({ panel: this.panel, resolvedPanes, originMappings /*, resolvedContexts */ }).pipe(
      map(({ resolvedPanes, originMappings/*, resolvedContexts */ }) => ({ panes, resolvedPanes, originMappings }))
    )),
    tap(() => console.log(`schdule renderer after [${this.panel.name}]`)),
  ).subscribe(({ panes, resolvedPanes, originMappings/*, resolvedContexts*/ }) => {
    console.log(`render panel: ${this.panel.name}`);
    this.resolvedPanes = resolvedPanes;
    this.originPanes = panes;
    this.originMappings = originMappings;
    // this.resolvedContexts = resolvedContexts;
    if(this.paneContainer && this.stylePlugin === undefined) {
      // setTimeout(() => this.heightChange.emit(this.paneContainer.nativeElement.offsetHeight));
    }
    this.populatePanesFormArray();
    if(this.stylePlugin !== undefined) {
      this.renderPanelContent();
    } else {
      this.rendered$.next(undefined);
    }

    // clearInterval(this.initialRenderComplete);
  });

  schduleContextChangeSub: Subscription;
  schduleContextChange = new Subject<string>();

  schedulePanelRenderSub = this.schedulePanelRender.pipe(
    switchMap(p => this.spm.getPlugin(p))
  ).subscribe((stylePlugin: StylePlugin) => {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(stylePlugin.renderComponent);

    const viewContainerRef = this.panelHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    this.componentRef = componentRef;
    (componentRef.instance as any).settings = this.panel.settings;
    /**
     * I think this is an oversight. The current code is passing ALL the panes
     * as the panes array. I believe that change was recently made to facilitate
     * new behavior. I just don't think this was ever updated... Updating now
     * and we will see how it goes.
     */
    (componentRef.instance as any).panes = this.resolvedPanes;
    // This breaks pages because none visible panes will attempt to be rendered.
    //(componentRef.instance as any).panes = this.panel.panes;
    (componentRef.instance as any).originPanes = this.panel.panes;
    (componentRef.instance as any).originMappings = this.originMappings;
    (componentRef.instance as any).contexts = this.contexts.map(c => new InlineContext(c));
    (componentRef.instance as any).displayType = this.displayType;
    (componentRef.instance as any).ancestory = this.ancestoryWithSelf$.value;
    // (componentRef.instance as any).resolvedContexts = this.resolvedContexts;
    (componentRef.instance as any).resolvedContext = this.resolvedContext;
    (componentRef.instance as any).panel = this.panel;
    (componentRef.instance as any).indexPosition = this.indexPosition$.value;

    this.rendered$.next(undefined);
  });

  resolvedPanes: Array<Pane>;
  originMappings: Array<number> = [];
  resolvedContexts: Array<any> = [];
  // ancestoryWithSelf: Array<number> = [];
  readonly ancestoryWithSelf$ = new BehaviorSubject<Array<number>>([]);
  readonly ancestory$ = new BehaviorSubject<Array<number>>([]);
  readonly indexPosition$ = new BehaviorSubject<number>(undefined);

  resolveContextsSub: Subscription;

  // stylePlugins: Array<StylePlugin> = [];
  stylePlugin: string;

  // contentPlugins: Array<ContentPlugin> = [];

  public onTouched: () => void = () => {};

  private counter: number;

  @ViewChild(PaneContentHostDirective, { static: true }) panelHost: PaneContentHostDirective;
  @ViewChild('panes', { static: true }) paneContainer: ElementRef;

  private readonly ancestorySub = combineLatest([
    this.ancestory$,
    this.indexPosition$
  ]).pipe(
    tap(([ancestory, indexPosition]) => {
      this.ancestoryWithSelf$.next([ ...ancestory, indexPosition ]);
    })
  ).subscribe();

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
        map(ctx => ctx.filter(c => c !== '_page' && c !== '_root' && c !== '.' && c.indexOf('panestate-' + this.ancestoryWithSelf$.value.join('-')) !== 0)),
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
    // this.ancestoryWithSelf = [ ...(this.ancestory ? this.ancestory: []), ...( this.indexPosition !== undefined && this.indexPosition !== null? [ this.indexPosition ] : [] ) ];
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
    /*if (changes.ancestory || changes.indexPosition) {
      const ancestoryWithSelf = [ ...(changes.ancestory.currentValue ? changes.ancestory.currentValue :  this.ancestory ? this.ancestory : []), ...( changes.indexPosition.currentValue !== undefined && changes.indexPosition.currentValue !== null? [ changes.indexPosition.currentValue ] : this.indexPosition ? [ this.indexPosition ] : [] ) ];
      if (ancestoryWithSelf.length !== this.ancestoryWithSelf.length || this.ancestoryWithSelf.filter((n, index) => ancestoryWithSelf[index] !== n).length !== 0) {
        this.ancestoryWithSelf = ancestoryWithSelf;
      }
    }*/
  }

  ngAfterViewInit() {
  }

  ngAfterContentInit() {
    this.afterContentInit$.next(undefined);
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
