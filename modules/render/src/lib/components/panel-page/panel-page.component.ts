import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges, ElementRef, Inject, TemplateRef, ComponentFactoryResolver, ComponentRef, AfterViewInit, ViewEncapsulation, forwardRef, HostBinding, AfterContentInit, Renderer2, Output, EventEmitter, ViewChildren, QueryList, NgZone, PLATFORM_ID, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, ControlValueAccessor, Validator, NG_VALIDATORS, NG_VALUE_ACCESSOR, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EntityServices, EntityCollectionService, EntityCollection, EntityDefinitionService } from '@ngrx/data';
import { CONTENT_PLUGIN, ContentPlugin, ContentPluginManager } from '@ng-druid/content';
import { GridLayoutComponent, LayoutPluginManager } from '@ng-druid/layout';
import { AsyncApiCallHelperService, StyleLoaderService } from '@ng-druid/utils';
import { /*ContextManagerService, */ InlineContext, ContextPluginManager, InlineContextResolverService } from '@ng-druid/context';
import { PanelPage, Pane, LayoutSetting, CssHelperService, PanelsContextService, PageBuilderFacade, FormService, PanelPageForm, PanelPageState, PanelContentHandler, PaneStateService, Panel, StylePlugin, PanelResolverService, StylePluginManager, StyleResolverService } from '@ng-druid/panels';
import { DisplayGrid, GridsterConfig, GridType, GridsterItem } from 'angular-gridster2';
import { fromEvent, Subscription, BehaviorSubject, Subject, iif, of, forkJoin, Observable, combineLatest, interval } from 'rxjs';
import { filter, tap, debounceTime, take, skip, scan, delay, switchMap, map, bufferTime, timeout, defaultIfEmpty, concatAll, concat, concatWith, reduce, bufferToggle, concatMap, toArray, distinctUntilChanged, bufferWhen, takeUntil, flatMap, withLatestFrom } from 'rxjs/operators';
import { getSelectors, RouterReducerState } from '@ngrx/router-store';
import { Store, select, createSelector } from '@ngrx/store';
import { LayoutRendererHostDirective } from '../../directives/layout-renderer-host.directive';
import * as uuid from 'uuid';
import * as cssSelect from 'css-select';
import { JSONNode } from 'cssjson';
import { AttributeSerializerService, AttributeValue } from '@ng-druid/attributes';
import { PaneContentHostDirective } from '../../directives/pane-content-host.directive';
import { CrudDataHelperService, CrudEntityMetadata } from '@ng-druid/crud';
import { EmptyLayoutComponent } from '../empty-layout/empty-layout.component';
import { isPlatformServer } from '@angular/common';
import { PersistService } from '@ng-druid/refinery';

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
export class PanelPageComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy, ControlValueAccessor, Validator {

  static registredContextListeners = new Set<string>();

  @Input()
  set id(id: string) {
    this.id$.next(id);
  }

  @Input()
  set panelPage(panelPage: PanelPage) {
    this.panelPage$.next(panelPage);
  }

  @Input()
  set nested(nested: boolean) {
    this.nested$.next(nested);
  }

  @Input()
  set contexts(contexts: Array<InlineContext>) {
    this.contexts$.next(contexts);
  }

  @Input()
  set ancestory(ancestory: Array<number>) {
    this.ancestory$.next(ancestory);
  }

  @Input() 
  set css(css: JSONNode) {
    this.css$.next(css);
  }

  @Input()
  resolvedContext = {}

  contextsChanged: Array<string> = [];
  layoutRendererRef: ComponentRef<any>;
  panelPageCached: PanelPage;
  persistenceEnabled = false;

  readonly onInit$ = new Subject();
  readonly afterViewInit$ = new Subject();
  readonly afterContentInit$ = new Subject();
  readonly renderLayout$ = new Subject<PanelPage>();

  readonly id$ = new BehaviorSubject<string>(undefined);
  readonly panelPage$ = new BehaviorSubject<PanelPage>(undefined);
  readonly nested$ = new BehaviorSubject<boolean>(false);
  readonly ancestory$ = new BehaviorSubject<Array<number>>([]);
  readonly contexts$ = new BehaviorSubject<Array<InlineContext>>([]);

  private readonly instanceUniqueIdentity = uuid.v4()

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

  private panelPageService: EntityCollectionService<PanelPage>;
  private panelPageFormService: EntityCollectionService<PanelPageForm>;
  private panelPageStateService: EntityCollectionService<PanelPageState>;

  bridgeSub = this.pageForm.valueChanges.pipe(
    filter(() => this.nested$.value),
    debounceTime(500)
  ).subscribe(v => {
    console.log('write page');
    console.log(v);
    this.settingsFormArray.clear();
    const newGroup = this.attributeSerializer.convertToGroup(this.attributeSerializer.serialize(v, 'value').attributes[0]);
    this.settingsFormArray.push(newGroup);
    console.log(newGroup.value);
  });

  @ViewChild(GridLayoutComponent, {static: false}) gridLayout: GridLayoutComponent;
  @ViewChild('renderPanelTpl', { static: true }) renderPanelTpl: TemplateRef<any>;
  @ViewChild(LayoutRendererHostDirective, { static: false }) layoutRendererHost: LayoutRendererHostDirective;

  readonly idOrPanelPageSub = combineLatest([
    this.id$,
    this.panelPage$
  ]).pipe(
    distinctUntilChanged(),
    map(([ id, panelPage ]) => ({ id, panelPage })),
    filter(({ id, panelPage }) => !!id || !!panelPage),
    switchMap(({ id, panelPage }) => iif(
      () => !id,
      of({ panelPage }),
      new Observable<{ panelPage: PanelPage }>(obs => {
          const metadata = this.entityDefinitionService.getDefinition('PanelPage').metadata as CrudEntityMetadata<any, {}>;
          return this.crudDataHelperService.evaluateCollectionPlugins<PanelPage>({ query: `identity=${id}`, plugins: metadata.crud, op: 'query' }).pipe(
            map(objects => objects && objects.length !== 0 ? objects[0] : undefined),
            tap(p => {
              obs.next({ panelPage: p });
              obs.complete();
            })
          ).subscribe();
      })
    )),
    switchMap(({ panelPage }) =>
      this.cpm.getPlugins(
        panelPage.panels.reduce<Array<string>>((contentPlugins, c) => {
          c.panes.forEach(pane => {
            if(!contentPlugins.includes(pane.contentPlugin)) {
              contentPlugins.push(pane.contentPlugin);
            }
          });
          return contentPlugins;
        }, [])
      ).pipe(
        map(() => ({ panelPage }))
      )
    ),
    switchMap(({ panelPage }) => iif(
      () => !this.nested$.value,
      /*!this.nested ? this.panelsContextService.allActivePageContexts({ panelPage: p }).pipe(
        map(paneContexts => [p, isDynamic, paneContexts])
      ): of([p, isDynamic, []]),*/
      this.panelsContextService.allActivePageContexts({ panelPage }).pipe(
        map(paneContexts => ({ panelPage, contexts: Array.from(paneContexts) }))
      ),
      of({ panelPage, contexts: [] })
    )),
    /*switchMap(({ panelPage, isDynamic }) => this.panelsContextService.allActivePageContexts({ panelPage }).pipe(
      map(paneContexts => ({ panelPage, isDynamic, contexts: Array.from(paneContexts) }))
    )),*/
    tap(({ panelPage, contexts }) => {
      this.hookupFormChange({ panelPage });
      this.populatePanelsFormArray({ panelPage });
      this.panelPageCached = panelPage;
      this.persistenceEnabled = panelPage.persistence && panelPage.persistence.dataduct && panelPage.persistence.dataduct.plugin && panelPage.persistence.dataduct.plugin !== '';
      this.renderLayout$.next(panelPage);
      // this.panelPage$.next(panelPage);
      this.contexts$.next([ ...(panelPage.contexts ? panelPage.contexts.map(c => new InlineContext(c)) : []), ...contexts ]);
      /*if(!this.nested$.value || isDynamic ) {
        this.hookupContextChange();
      }*/
      if (panelPage.cssFile && panelPage.cssFile.trim() !== '') {
        this.hookupCss({ file: panelPage.cssFile.trim() });
      }
      console.log(`cached panel page: ${panelPage.id}`);
    })
  ).subscribe();

  readonly hookupContextSub = combineLatest(
    this.contexts$,
    // this.nested$,
    this.afterContentInit$
  ).pipe(
    // filter(([ _, nested ]) => !nested),
    map(([ contexts ]) => contexts),
    switchMap(contexts => this.inlineContextResolver.resolveMerged(contexts, `panelpage:${uuid.v4()}`).pipe(
      switchMap(resolvedContext => this.cxm.getPlugins().pipe(
        map(plugins => ({ contexts, resolvedContext, globalPlugins: Array.from(plugins.values()).filter(p => p.global === true) }))
      )),
      take(1)
    )),
    tap(() => {
      if (this.resolveSub) {
        this.resolveSub.unsubscribe();
      }
    }),
    tap(({ contexts, resolvedContext, globalPlugins }) => {
      this.resolvedContext = resolvedContext;
      const short$ = new Subject<void>();
      if (isPlatformServer(this.platformId)) {
        const interval = setInterval(() => {
          if (PanelPageComponent.registredContextListeners.size === 0) {
            short$.next();
            short$.complete();
            clearInterval(interval);
          }
        }, 1000);
      }
      this.resolveSub = this.inlineContextResolver.resolveMergedSingle(contexts).pipe(
        skip(globalPlugins.length + (contexts ? contexts.length : 0)),
        tap(() => PanelPageComponent.registredContextListeners.add(this.instanceUniqueIdentity)),
        bufferTime(1),
        tap(buffered => {
          this.contextsChanged = buffered.reduce((p, [cName, _]) => [ ...p, ...(p.includes(cName) ? [] : [cName]) ], []);
          this.resolvedContext = buffered.reduce((p, [cName, cValue]) => ({ ...p, [cName]: cValue }), this.resolvedContext);
        }),
        tap(() => PanelPageComponent.registredContextListeners.delete(this.instanceUniqueIdentity)),
        isPlatformServer(this.platformId) ? takeUntil(short$) : tap(() => {})
      ).subscribe();
    })
  ).subscribe();

  readonly renderLayoutSub = combineLatest([
    this.renderLayout$,
    this.afterViewInit$
  ]).pipe(
    delay(1),
    map(([ panelPage ]) => ({ panelPage })),
    switchMap(({ panelPage }) => this.lpm.getPlugin(panelPage.layoutType).pipe(
      map(plugin => ({ panelPage, plugin }))
    )),
    tap(() => console.log('start render layout')),
    map(({ plugin, panelPage }) => ({ panelPage, plugin, viewContainerRef: this.layoutRendererHost.viewContainerRef })),
    tap(({ viewContainerRef }) => viewContainerRef.clear()),
    map(({ plugin, viewContainerRef, panelPage }) => ({ panelPage, layoutRendererRef: viewContainerRef.createComponent(plugin.renderer) })),
    tap(({ layoutRendererRef }) => this.layoutRendererRef = layoutRendererRef),
    tap(({ layoutRendererRef, panelPage })=> {
      (layoutRendererRef.instance as any).renderPanelTpl = this.renderPanelTpl;
      (layoutRendererRef.instance as any).panelPage = panelPage;
    }),
    tap(() => console.log('end render layout'))
  ).subscribe();

  get panelsArray(): FormArray {
    return this.pageForm.get('panels') as FormArray;
  }

  public onTouched: () => void = () => {};

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
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
    private crudDataHelperService: CrudDataHelperService,
    protected entityDefinitionService: EntityDefinitionService,
    private ngZone: NgZone,
    private persistService: PersistService,
    es: EntityServices,
  ) {
    this.panelPageService = es.getEntityCollectionService('PanelPage');
    this.panelPageFormService = es.getEntityCollectionService('PanelPageForm');
    this.panelPageStateService = es.getEntityCollectionService('PanelPageState');
  }

  ngOnInit() {
    this.onInit$.next(undefined);
  }

  ngAfterViewInit() {
    this.afterViewInit$.next(undefined);
  }

  ngAfterContentInit() {
    this.afterContentInit$.next(undefined);
  }

  ngOnDestroy() {
    PanelPageComponent.registredContextListeners.delete(this.instanceUniqueIdentity);
  }

  populatePanelsFormArray({ panelPage }: { panelPage: PanelPage }) {
    this.panelsArray.clear();
    panelPage.panels.forEach(() => {
      this.panelsArray.push(this.fb.control(''));
    });
  }

  hookupFormChange({ panelPage }: { panelPage: PanelPage }) {
    this.pageForm.valueChanges.pipe(
      debounceTime(100),
      filter(() => panelPage !== undefined && panelPage.displayType === 'form')
    ).subscribe(v => {
      const form = new PanelPageForm({ ...v, name: panelPage.name, title: panelPage.title, derivativeId: panelPage.id});
      this.pageBuilderFacade.setForm(panelPage.name, form);
    });
  }

  hookupCss({ file }: { file: string }) {
    this.http.get<JSONNode>(file).subscribe(css => {
      this.filteredCss = css;
    });
  }

  submit() {
    const panelPageForm = new PanelPageForm({ ...this.pageForm.value, id: uuid.v4() });
    const data = this.formService.serializeForm(panelPageForm);
    console.log(panelPageForm);
    console.log(this.formService.serializeForm(panelPageForm));
    /*this.panelPageFormService.add(panelPageForm).subscribe(() => {
      alert('panel page form added!');
    });*/

    this.persistService.persist({ data, persistence: this.panelPageCached.persistence }).subscribe(() => {
      console.log('persisted data');
    });;

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