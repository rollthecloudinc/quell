import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges, ElementRef, Inject, TemplateRef, ComponentFactoryResolver, ComponentRef, AfterViewInit, ViewEncapsulation, forwardRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, ControlValueAccessor, Validator, NG_VALIDATORS, NG_VALUE_ACCESSOR, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EntityServices, EntityCollectionService, EntityCollection } from '@ngrx/data';
import { CONTENT_PLUGIN, ContentPlugin, ContentPluginManager } from 'content';
import { GridLayoutComponent, LayoutPluginManager } from 'layout';
import { AsyncApiCallHelperService, StyleLoaderService } from 'utils';
import { /*ContextManagerService, */ InlineContext, ContextPluginManager, InlineContextResolverService } from 'context';
import { PanelPage, Pane, LayoutSetting, CssHelperService, PanelsContextService, PageBuilderFacade, FormService, PanelPageForm, PanelPageState } from 'panels';
import { DisplayGrid, GridsterConfig, GridType, GridsterItem } from 'angular-gridster2';
import { fromEvent, Subscription, BehaviorSubject, Subject, iif, of, forkJoin, Observable, combineLatest } from 'rxjs';
import { filter, tap, debounceTime, take, skip, scan, delay, switchMap, map, bufferTime } from 'rxjs/operators';
import { getSelectors, RouterReducerState } from '@ngrx/router-store';
import { Store, select, createSelector } from '@ngrx/store';
import { LayoutRendererHostDirective } from '../../directives/layout-renderer-host.directive';
import * as uuid from 'uuid';
import * as cssSelect from 'css-select';
import { JSONNode } from 'cssjson';
import { AttributeSerializerService } from 'attributes';

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
