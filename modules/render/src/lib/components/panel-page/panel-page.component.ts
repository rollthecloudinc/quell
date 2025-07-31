import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges, ElementRef, Inject, TemplateRef, ComponentFactoryResolver, ComponentRef, AfterViewInit, ViewEncapsulation, forwardRef, HostBinding, AfterContentInit, Renderer2, Output, EventEmitter, ViewChildren, QueryList, NgZone, PLATFORM_ID, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormArray, ControlValueAccessor, Validator, NG_VALIDATORS, NG_VALUE_ACCESSOR, AbstractControl, ValidationErrors, Validators, NG_ASYNC_VALIDATORS, AsyncValidator } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EntityServices, EntityCollectionService, EntityCollection, EntityDefinitionService } from '@ngrx/data';
import { CONTENT_PLUGIN, ContentPlugin, ContentPluginManager } from '@rollthecloudinc/content';
import { GridLayoutComponent, LayoutPluginManager } from '@rollthecloudinc/layout';
import { AsyncApiCallHelperService, StyleLoaderService } from '@rollthecloudinc/utils';
import { FilesService, MediaSettings, MEDIA_SETTINGS } from '@rollthecloudinc/media';
import { InteractionEventPluginManager, InteractionHandlerPluginManager, InteractionListener } from '@rollthecloudinc/detour';
import { /*ContextManagerService, */ InlineContext, ContextPluginManager, InlineContextResolverService } from '@rollthecloudinc/context';
import { PanelPage, Pane, LayoutSetting, CssHelperService, PanelsContextService, PageBuilderFacade, FormService, PanelPageForm, PanelPageState, PanelContentHandler, PaneStateService, Panel, StylePlugin, PanelResolverService, StylePluginManager, StyleResolverService } from '@rollthecloudinc/panels';
import { DisplayGrid, GridsterConfig, GridType, GridsterItem } from 'angular-gridster2';
import { fromEvent, Subscription, BehaviorSubject, Subject, iif, of, forkJoin, Observable, combineLatest, interval } from 'rxjs';
import { filter, tap, debounceTime, take, skip, scan, delay, switchMap, map, bufferTime, timeout, defaultIfEmpty, concatAll, concat, concatWith, reduce, bufferToggle, concatMap, toArray, distinctUntilChanged, bufferWhen, takeUntil, flatMap, withLatestFrom, catchError, startWith, first } from 'rxjs/operators';
import { getRouterSelectors, RouterReducerState } from '@ngrx/router-store';
import { Store, select, createSelector } from '@ngrx/store';
import { LayoutRendererHostDirective } from '../../directives/layout-renderer-host.directive';
import * as uuid from 'uuid';
import * as cssSelect from 'css-select';
import { JSONNode } from 'cssjson';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { PaneContentHostDirective } from '../../directives/pane-content-host.directive';
import { CrudAdaptorPluginManager, CrudDataHelperService, CrudEntityMetadata } from '@rollthecloudinc/crud';
import { EmptyLayoutComponent } from '../empty-layout/empty-layout.component';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { PersistService } from '@rollthecloudinc/refinery';
import { StylizerService, ClassifyService, ClassClassification, ClassMap, isSelectorValid } from '@rollthecloudinc/sheath';
import { camelize } from 'inflected';
import merge from 'deepmerge-json';
import { DOCUMENT } from '@angular/common';
import { AuthFacade } from '@rollthecloudinc/auth';
import { Param, ParamEvaluatorService } from '@rollthecloudinc/dparam';

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
    /*{
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PanelPageComponent),
      multi: true
    },*/
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => PanelPageComponent),
      multi: true
    }
  ]
})
export class PanelPageComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy, ControlValueAccessor, AsyncValidator {

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
  set listeners(listeners: Array<InteractionListener>) {
    this.listeners$.next(listeners);
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
  private isStable = false;
  private managedCssCache = '';
  private managedClassesCache = {};

  filteredCss: { css: JSONNode, classes: any };
  filteredListeners: Array<InteractionListener> = [];

  css$ = new BehaviorSubject<{ css: JSONNode, classes: any }>({ css: this.cssHelper.makeJsonNode(), classes: {} });
  cssSub = this.css$.subscribe(css => {
    if (this.nested$.value) {
      console.log('filtered css nested', css);
    }
    this.filteredCss = css;
  });


  readonly listeners$ = new BehaviorSubject<Array<InteractionListener>>([]);
  readonly listenersSub = this.listeners$.pipe(
    tap(listeners => {
      this.filteredListeners = listeners;
    })
  ).subscribe();

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
      this.filteredListeners = panelPage.interactions && panelPage.interactions.interactions && panelPage.interactions.interactions.listeners ? panelPage.interactions.interactions.listeners : [];
      this.renderLayout$.next(panelPage);
      // this.panelPage$.next(panelPage);
      this.contexts$.next([ ...(panelPage.contexts ? panelPage.contexts.map(c => new InlineContext(c)) : []), ...contexts ]);
      /*if(!this.nested$.value || isDynamic ) {
        this.hookupContextChange();
      }*/
      this.hookupCss({ file: panelPage.cssFile ?  panelPage.cssFile.trim() : undefined });
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
        tap(v => console.log('buffer', v)),
        bufferTime(1),
        tap(buffered => {
          if (buffered.length === 0) {
            PanelPageComponent.registredContextListeners.delete(this.instanceUniqueIdentity);
          }
        }),
        filter(buffered => buffered.length !== 0),
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

  readonly stylizerSub = this.afterViewInit$.pipe(
    //filter(() => false), // @tofo: Note ready for prime time just yet.
    filter(() => isPlatformBrowser(this.platformId)),
    tap(() => {
      this.stylizerService.stylize({ targetNode: this.el.nativeElement });
    })
  ).subscribe();

  readonly classifySub = this.afterViewInit$.pipe(
    //filter(() => false), // @tofo: Note ready for prime time just yet.
    filter(() => isPlatformBrowser(this.platformId)),
    tap(() => {
      this.classifyService.classify({ targetNode: this.el.nativeElement });
    })
  ).subscribe();

  readonly stylizerMutatedSub = !isPlatformBrowser(this.platformId) ? undefined : this.stylizerService.mutated$.pipe(
    debounceTime(2000),
    skip(1),
    switchMap(({ stylesheet }) => this.authFacade.getUser$.pipe(
      map(u => ({ stylesheet, isAuthenticated: !!u })) // No sheath asset uploads are attempted unless user is at least authenticated.
    )),
    filter(({ isAuthenticated }) => isAuthenticated),
    tap(({ stylesheet  }) => {
      console.log('merged css', stylesheet );
    }),
    filter(() => !!this.panelPageCached && !!this.panelPageCached.id),
    // filter(() => false), // @tofo: Note ready for prime time just yet.
    switchMap(({ stylesheet  }) => this.isStable ? of({ stylesheet  }) : this.ngZone.onStable.asObservable().pipe(
      map(() => ({ stylesheet  })),
      take(1)
    )),
    map(({ stylesheet }) => ({ stylesheet: (this.managedCssCache && this.managedCssCache.trim() !== '' ? this.managedCssCache + "\n" : '') + stylesheet })),
    concatMap(({ stylesheet }) => this.fileService.bulkUpload({ nocache: true, files: [ new File([ stylesheet ], `panelpage__${this.panelPageCached.id}.css`) ], fileNameOverride: `panelpage__${this.panelPageCached.id}.css` })),
    tap(() => {
      console.log('stylesheet saved.');
    })
  ).subscribe();

  readonly classifyMutatedSub = !isPlatformBrowser(this.platformId) ? undefined : this.classifyService.mutated$.pipe(
    debounceTime(2000),
    skip(1),
    switchMap(({ classes }) => this.authFacade.getUser$.pipe( // No sheath asset uploads are attempted unless user is at least authenticated.
      map(u => ({ classes, isAuthenticated: !!u }))
    )),
    filter(({ isAuthenticated }) => isAuthenticated),
    tap(({ classes  }) => {
      console.log('merged classes', classes );
    }),
    filter(() => !!this.panelPageCached && !!this.panelPageCached.id),
    // filter(() => false), // @tofo: Note ready for prime time just yet.
    switchMap(({ classes }) => this.isStable ? of({ classes }) : this.ngZone.onStable.asObservable().pipe(
      map(() => ({ classes })),
      take(1)
    )),
    map(({ classes }) => ({ classes: Array.from(classes.keys()).reduce((p, k) => ({ ...p, [k]: Array.from(classes.get(k).keys()).filter(k2 => classes.get(k).get(k2) !== ClassClassification.KEEP).reduce((p2, k2) => ({ ...p2, [k2]: classes.get(k).get(k2) }), {}) }), {}) })),
    map(({ classes }) => ({ classes: merge(this.managedClassesCache, classes) })),
    map(({ classes }) => ({ json: JSON.stringify(classes) })),
    concatMap(({ json }) => this.fileService.bulkUpload({ nocache: true, files: [ new File([ json ], `panelpage__${this.panelPageCached.id}__classes.json`) ], fileNameOverride: `panelpage__${this.panelPageCached.id}__classes.json` })),
    tap(() => {
      console.log('classes saved.');
    })
  ).subscribe();

  readonly onStableSub = this.ngZone.onStable.asObservable().pipe(
    tap(() => this.isStable = true)
  ).subscribe();

  readonly onUnstableSub = this.ngZone.onUnstable.asObservable().pipe(
    tap(() => this.isStable = false)
  ).subscribe();

  readonly wireListenersSub = combineLatest([
    this.listeners$,
    this.renderLayout$,
    this.afterContentInit$,
  ]).pipe(
    delay(1),
    switchMap(() => forkJoin(this.filteredListeners.map(l => of({}).pipe(
        map(() => ({ paramNames: l.event.settings.paramsString ? l.event.settings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [] })),
        switchMap(({ paramNames }) => this.paramEvaluatorService.paramValues(l.event.settings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())).pipe(
          map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
        )),
        defaultIfEmpty([])
      )  
    ))),
    switchMap(listenerParams => this.iepm.getPlugin('dom').pipe(
      map(p => ({ p, listenerParams }))
    )),
    switchMap(({ p, listenerParams }) => p.connect({ 
      filteredListeners: this.filteredListeners, 
      listenerParams, 
      renderer: this.renderer,
      callback: ({ handlerParams, plugin, index, evt }) => {
        // console.log(`The handler was called`, handlerParams, plugin, index, this.filteredListeners[index], evt );
        this.ihpm.getPlugin(plugin).pipe(
          tap(p => {
            p.handle({ 
              handlerParams, 
              plugin, 
              index, 
              listener: this.filteredListeners[index], 
              evt, 
              renderer: this.renderer });
          })
        ).subscribe();
      }
    })),
    tap((listenerParams) => {
      console.log('listener info', this.filteredListeners, listenerParams);

      /*this.iepm.getPlugin('dom').subscribe(p => {
        p.connect({ 
          filteredListeners: this.filteredListeners, 
          listenerParams, 
          renderer: this.renderer,
          callback: ({ handlerParams, plugin, index, evt }) => {
            console.log(`The handler was called`, handlerParams, plugin, index, this.filteredListeners[index], evt );
          }
        }).subscribe();
      });*/

      // The hard way to handle events using our own delegation algorithm
      // since nodes are constantly changing underneath and simple way
      // doesn't seem to work.

      // This is all going to be part of the plugin function anyway.

      /*const mapTypes = new Map<string, Array<number>>();
      const len = this.filteredListeners.length;
      for (let i = 0; i < len; i++) {
        const type = (listenerParams[i] as  any).type;
        if (mapTypes.has(type)) {
          const targets = mapTypes.get(type);
          targets.push(i);
          mapTypes.set(type, targets);
        } else {
          mapTypes.set(type, [i]);
        }
      }
      const eventDelegtionHandler = (m => e => {
        if (m.has(e.type)) {
          const targets = m.get(e.type);
          const len = targets.length;
          targets.forEach((__, i) => {
            const expectedTarget = (listenerParams[targets[i]] as any).target;
            if (e.target.matches(expectedTarget)) {
              console.log(`delegated target match ${expectedTarget}`);
              if(this.filteredListeners[i].handler.settings.params) {
                const paramNames = this.filteredListeners[i].handler.settings.paramsString ? this.filteredListeners[i].handler.settings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [];
                this.paramEvaluatorService.paramValues(
                  this.filteredListeners[i].handler.settings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())
                ).pipe(
                  map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
                ).subscribe((handlerParams) => {
                  // plugin call and pass params
                  console.log('handler original event and params', e, this.filteredListeners[i].handler.plugin,  handlerParams);
                })
              } else {
                // plugin call and pass params
                console.log('handler original event and params', this.filteredListeners[i].handler.plugin, e);
              }
            }
          });
        }
      })(mapTypes)
      const keys = Array.from(mapTypes);
      for (let i = 0; i < keys.length; i++) {
        const type = keys[i][0];
        this.renderer.listen('document', type, e => {
          eventDelegtionHandler(e);
        });
      }*/

      /*this.renderer.listen('document', 'click', e => {
        console.log('delegated target');
        if (e.target.matches('.open-dialog')) {
          console.log('delegated target match');
        }
      });*/

      /*const listenerLen = this.filteredListeners.length;
      for (let i = 0; i < listenerLen; i++) {
        // Assumption is made herre that would be responsibility of plugin instead ie. target is required for DOM event.
        // For now though just to get things spinning again hard code expectation.
        const targets =(this.el.nativeElement as Element).querySelectorAll((listenerParams[i] as  any).target);
        console.log('listener target', targets);
        targets.forEach(t => this.renderer.listen(t, (listenerParams[i] as  any).type, e => {
          console.log('listener fired');
          if(this.filteredListeners[i].handler.settings.params) {
            const paramNames = this.filteredListeners[i].handler.settings.paramsString ? this.filteredListeners[i].handler.settings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [];
            this.paramEvaluatorService.paramValues(
              this.filteredListeners[i].handler.settings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())
            ).pipe(
              map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
            ).subscribe((handlerParams) => {
              console.log('handler original event and params',e,  handlerParams);
            });
          } else {
            console.log('handler original event and params', e);
          }
        }));
      }*/
    })
  ).subscribe()

  get panelsArray(): UntypedFormArray {
    return this.pageForm.get('panels') as UntypedFormArray;
  }

  public onTouched: () => void = () => {};

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(MEDIA_SETTINGS) private mediaSettings: MediaSettings,
    private routerStore: Store<RouterReducerState>,
    private fb: UntypedFormBuilder,
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
    private stylizerService: StylizerService,
    private classifyService: ClassifyService,
    private fileService: FilesService,
    private authFacade: AuthFacade,
    private paramEvaluatorService:  ParamEvaluatorService,
    private renderer: Renderer2,
    private iepm: InteractionEventPluginManager,
    private ihpm: InteractionHandlerPluginManager,
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
    forkJoin([
      /*this.http.get<JSONNode>(file).pipe(
        catchError(() => of(undefined)),
        defaultIfEmpty(undefined)
      ),*/
      of(undefined),
      // Disable this for now since 400s have negative impact on page scoring
      /*this.panelPageCached.id ? this.http.get<JSONNode>(`${this.mediaSettings.imageUrl}/media/panelpage__${this.panelPageCached.id}.css.json`).pipe(
        catchError(() => of(undefined)),
        defaultIfEmpty(undefined)
      ) : of(undefined),*/
      of(undefined),
      // Disable this for now since 400s have negative impact on page scoring
      /*
      this.panelPageCached.id ? this.http.get<JSONNode>(`${this.mediaSettings.imageUrl}/media/panelpage__${this.panelPageCached.id}.css`).pipe(
        catchError(() => of(undefined)),
        defaultIfEmpty(undefined)
      ) : of(undefined),*/
      of(undefined),
      this.panelPageCached.id ? this.http.get<JSONNode>(`${this.mediaSettings.imageUrl}/media/panelpage__${this.panelPageCached.id}__classes.json`).pipe(
        catchError(() => of(undefined)),
        defaultIfEmpty(undefined)
      ) : of(undefined),
    ]).pipe(
      tap(([ cssFile, managedCss, managedCssRaw, classes ]) => {
        console.log('fetched managed panelpage css and class files');
        let css = {};
        this.managedCssCache = '';
        this.managedClassesCache = classes;
        if (cssFile) {
          css = merge(css, cssFile);
        }
        if (managedCss) {
          this.managedCssCache = managedCssRaw;
          css = merge(css, managedCss);
        }
        this.filteredCss = { css, classes };
      })
    ).subscribe();
    /*
    this.http.get<JSONNode>(file).subscribe(css => {
      this.filteredCss = css; //css.styles; - only for sheath
    });*/
  }

  submit() {

    if (this.pageForm.valid) {
      const panelPageForm = new PanelPageForm({ ...this.pageForm.value });
      const data = this.formService.serializeForm(panelPageForm);
      console.log(panelPageForm);
      console.log(this.formService.serializeForm(panelPageForm));
      /*this.panelPageFormService.add(panelPageForm).subscribe(() => {
        alert('panel page form added!');
      });*/
  
      console.log('form data', data);
  
      this.persistService.persist({ data, persistence: this.panelPageCached.persistence }).subscribe(() => {
        console.log('persisted data');
      });;
    } else {
      console.log('detected form invalid');
    }

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

  validate(c: AbstractControl): Observable<ValidationErrors | null> {
    /*return this.settingsFormArray.statusChanges.pipe(
      startWith(this.settingsFormArray.status),  // start with the current form status
      filter((status) => status === 'VALID'),
      map(() => null),
      timeout(1000),
      catchError(() => of({ invalidForm: {valid: false, message: "content is invalid"}})),
      first()
    );*/
    return this.settingsFormArray.statusChanges.pipe(
      startWith(this.settingsFormArray.status),  // start with the current form status
      filter((status) => status !== 'PENDING'),
      debounceTime(1),
      take(1), // We only want one emit after status changes from PENDING
      map((status) => {
          return this.settingsFormArray.valid ? null : { invalidForm: {valid: false, message: "content is invalid"}}; // I actually loop through the form and collect the errors, but for validity just return this works fine
      })
    );
    // return of(this.settingsFormArray.valid ? null : { invalidForm: {valid: false, message: "content is invalid"}});
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
    /*{
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RenderPaneComponent),
      multi: true
    },*/
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => RenderPaneComponent),
      multi: true
    }
  ],
  host: {
    '[class.pane]': 'true',
    '[attr.data-index]': 'indexPosition'
  }
})
export class RenderPaneComponent implements OnInit, OnChanges, ControlValueAccessor, AsyncValidator, AfterContentInit {

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
  panes: Array<Pane> = [];

  @Input()
  originPanes: Array<Pane> = [];

  @Input() set resolvedContext(resolvedContext: any) {
    this.resolvedContext$.next(resolvedContext);
  }

  @Input() set css(css: JSONNode) {
    this.css$.next(css);
  }

  @Input() set listeners(listeners: Array<InteractionListener>) {
    this.listeners$.next(listeners);
  }

  @HostBinding('class') get indexPositionClass() {
    return `pane-${this.indexPosition}`;
  } 

  readonly afterContentInit$ = new Subject();
  readonly resolvedContext$ = new BehaviorSubject<any>({});
  private schedulePluginChange = new Subject();

  contentPlugin: ContentPlugin;
 
  panelPage: PanelPage;

  embedPanel: PanelPage;

  ancestoryWithSelf: Array<number> = [];

  componentRef: ComponentRef<any>;

  filteredCss: { css: JSONNode, classes: any };
  filteredListeners: Array<InteractionListener> = [];

  css$ = new BehaviorSubject<{ css: JSONNode, classes: any }>({ 
    css: this.cssHelper.makeJsonNode(), 
    classes: {}
  });
  cssSub = combineLatest([
    this.css$,
    this.afterContentInit$,
    this.schedulePluginChange
  ]).pipe(
    map(([s]) => s),
    map(s => ({ css: this.cssHelper.reduceCss(s.css, `.pane-${this.indexPosition}`), classes: this.cssHelper.reduceSelector(s.classes, `.pane-${this.indexPosition}`) })),
    map(({ css, classes }) => [
      this.cssHelper.reduceCss(css, '.panel-page', false),
      this.cssHelper.reduceCss(css, '.panel-page'),
      this.cssHelper.reduceSelector(classes, '.panel-page', false),
      this.cssHelper.reduceSelector(classes, '.panel-page')
    ]),
    tap(([_, nestedCss, __, nestedClasses]) => this.filteredCss = { css: nestedCss, classes: nestedClasses }),
    map(([css, _, classes, __]) => ({ css, classes })),
    map(({ css, classes }) => {
      const rebuiltCss = Object.keys(css.children).reduce((p, c) => ({ ...p, ...(c.indexOf('>') === 0 ? { [this.ancestoryWithSelf.map((v, k) => (k+1) % 2 === 0 ? `.pane-${v}` : `.panel-${v}`).join(' ') + ' ' + c]: classes[c] } : { [c]: classes[c] }) }), {});
      const rebuiltClasses = Object.keys(classes).reduce((p, c) => ({ ...p, ...(c.indexOf('>') === 0 ? { [this.ancestoryWithSelf.map((v, k) => (k+1) % 2 === 0 ? `.pane-${v}` : `.panel-${v}`).join(' ') + ' ' + c]: classes[c] } : { [c]: classes[c] }) }), {});
      return { css: { children: rebuiltCss }, classes: rebuiltClasses };
    }),
    delay(500),
  ).subscribe(({ css, classes }) => {
    console.log('reduced classes', classes);
    const keys = Object.keys(css.children).filter(k => k === '' || isSelectorValid({ selector: k, document: this.document }));
    const classKeys = Object.keys(classes).filter(k => k === '' || isSelectorValid({ selector: k, document: this.document }));
    classKeys.forEach((k, keyIndex) => {
      const matchedNodes = k === '' ? [ this.el.nativeElement ] : k.indexOf('>') !== -1 ? this.document.querySelectorAll(k) : this.el.nativeElement.querySelectorAll(k);
      const len = matchedNodes.length;
      for (let i = 0; i < len; i++) {
        const c = classes[classKeys[keyIndex]];
        const cKeys = Object.keys(c);
        const cLen = cKeys.length;
        for (let j = 0; j < cLen; j++) {
          if (matchedNodes[i]) {
            if (c[cKeys[j]] === ClassClassification.REMOVE) {
              console.log(`remove class ${cKeys[j]}`);
              this.renderer2.removeClass(matchedNodes[i], cKeys[j]);
            } else {
              console.log(`add class ${cKeys[j]}`);
              this.renderer2.addClass(matchedNodes[i], cKeys[j]);
            }
          }
        }
      }
    });
    keys.forEach(k => {
      console.log(`search: ${k}`);
      const matchedNodes = k === '' ? [ this.el.nativeElement ] : k.indexOf('>') !== -1 ? this.document.querySelectorAll(k) : this.el.nativeElement.querySelectorAll(k);
      const len = matchedNodes.length;
      const rules = Object.keys(css.children[k].attributes);
      for (let i = 0; i < len; i++) {
        if (matchedNodes[i]) {
          rules.forEach(p => {
            console.log(`${k} { ${p}: ${css.children[k].attributes[p]}; }`);
            const prop = camelize(p.replace('-', '_'), false); // @todo: Not working for custom sheet 
            this.renderer2.setStyle(matchedNodes[i], /*p*/ prop, css.children[k].attributes[p]);
          });
        }
      }
    });
  });

  readonly listeners$ = new BehaviorSubject<Array<InteractionListener>>([]);
  readonly listenersSub = combineLatest([
    this.listeners$,
    this.schedulePluginChange 
  ]).pipe(
    map(([l]) => l),
    tap(listeners => {
      this.filteredListeners = listeners
      console.log('pane listeners', listeners);
    })
  ).subscribe();

  readonly wireListenersSub = combineLatest([
    this.listeners$,
    this.afterContentInit$,
  ]).pipe(
    delay(1),
    switchMap(() => forkJoin(this.filteredListeners.map(l => of({}).pipe(
        map(() => ({ paramNames: l.event.settings.paramsString ? l.event.settings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [] })),
        switchMap(({ paramNames }) => this.paramEvaluatorService.paramValues(l.event.settings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())).pipe(
          map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
        )),
        defaultIfEmpty([])
      )  
    ))),
    tap((listenerParams) => {
      console.log('listener info', this.filteredListeners, listenerParams);
      const listenerLen = this.filteredListeners.length;
      for (let i = 0; i < listenerLen; i++) {
        // Assumption is made herre that would be responsibility of plugin instead ie. target is required for DOM event.
        // For now though just to get things spinning again hard code expectation.
        const targets =(this.el.nativeElement as Element).querySelectorAll((listenerParams[i] as  any).target);
        console.log('listener target', targets);
        targets.forEach(t => this.renderer.listen(t, (listenerParams[i] as  any).type, e => {
          console.log('listener fired');
          if(this.filteredListeners[i].handler.settings.params) {
            const paramNames = this.filteredListeners[i].handler.settings.paramsString ? this.filteredListeners[i].handler.settings.paramsString.split('&').filter(v => v.indexOf('=:') !== -1).map(v => v.split('=', 2)[1].substr(1)) : [];
            this.paramEvaluatorService.paramValues(
              this.filteredListeners[i].handler.settings.params.reduce((p, c, i) => new Map<string, Param>([ ...p, [ paramNames[i], c ] ]), new Map<string, Param>())
            ).pipe(
              map(params => Array.from(params).reduce((p, [k, v]) =>  ({ ...p, [k]: v }), {}))
            ).subscribe((handlerParams) => {
              console.log('handler original event and params',e,  handlerParams);
            });
          } else {
            console.log('handler original event and params', e);
          }
        }));

      }
    })
  ).subscribe()

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

  private embedPanelSub = this.resolvedContext$.pipe(
    map((rc: any) => {
      if (rc && rc._root && !this.linkedPageId && this.settings.length === 0) {
        this.embedPanel = new PanelPage(rc._root);
      }
    })
  ).subscribe();

  @ViewChild(PaneContentHostDirective, { static: true }) contentPaneHost: PaneContentHostDirective;

  get dynamicPanel(): PanelPage {
    return new PanelPage((this.resolvedContext as any)._root);
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private el: ElementRef,
    private renderer2: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private panelHandler: PanelContentHandler,
    private fb: UntypedFormBuilder,
    private cpm: ContentPluginManager,
    private cssHelper: CssHelperService,
    private paneStateService: PaneStateService,
    private paramEvaluatorService: ParamEvaluatorService,
    private renderer: Renderer2,
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

  validate(c: AbstractControl): Observable<ValidationErrors | null> {
    /*return this.paneForm.statusChanges.pipe(
      startWith(this.paneForm.status),  // start with the current form status
      filter((status) => status === 'VALID'),
      map(() => null),
      timeout(1000),
      catchError(() => of({ invalidForm: { invalidForm: {valid: false, message: "pane is invalid"}}})),
      first()
    );*/
    return this.paneForm.statusChanges.pipe(
      startWith(this.paneForm.status),  // start with the current form status
      filter((status) => status !== 'PENDING'),
      debounceTime(1),
      take(1), // We only want one emit after status changes from PENDING
      map((status) => {
          return this.paneForm.valid ? null : { invalidForm: { invalidForm: {valid: false, message: "pane is invalid"}}}; // I actually loop through the form and collect the errors, but for validity just return this works fine
      })
    );
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
    (this.componentRef.instance as any).resolvedContext = this.resolvedContext$.value;
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
    /*{
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RenderPanelComponent),
      multi: true
    },*/
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => RenderPanelComponent),
      multi: true
    },
  ],
  host: {
    '[class.panel]': 'true',
    '[attr.data-index]': 'indexPosition$.value'
  }
})
export class RenderPanelComponent implements OnInit, AfterViewInit, AfterContentInit, OnChanges, ControlValueAccessor, AsyncValidator  {

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

  @Input() set listeners(listeners: Array<InteractionListener>) {
    this.listeners$.next(listeners);
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

  filteredCss: { css: JSONNode, classes: any };
  filteredListeners: Array<InteractionListener> = [];
  
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

  css$ = new BehaviorSubject<{ css: JSONNode, classes: any }>({ css: this.cssHelper.makeJsonNode(), classes: {} });
  cssSub = combineLatest([
    this.css$,
    this.afterContentInit$,
    this.rendered$
  ]).pipe(
    tap(([s]) => console.log('css node', s.css)),
    map(([s]) => s),
    map(s => ({ css: this.cssHelper.reduceCss(s.css, `.panel-${this.indexPosition$.value}`), classes: this.cssHelper.reduceSelector(s.classes, `.panel-${this.indexPosition$.value}`) })),
    map(({ css, classes }) => [
      this.cssHelper.reduceCss(css, '.pane-', false),
      css,
      this.cssHelper.reduceSelector(classes, '.pane-', false),
      classes
    ]),
    tap(([_, nestedCss, __, nestedClasses]) => this.filteredCss = { css: nestedCss, classes: nestedClasses }),
    map(([css, _, classes]) => ({ css, classes })),
    map(({ css, classes }) => {
      const rebuiltCss = Object.keys(css.children).reduce((p, c) => ({ ...p, ...(c.indexOf('>') === 0 ? { [this.ancestoryWithSelf$.value.map((v, k) => (k+1) % 2 === 0 ? `.pane-${v}` : `.panel-${v}`).join(' ') + ' ' + c]: classes[c] } : { [c]: classes[c] }) }), {});
      const rebuiltClasses = Object.keys(classes).reduce((p, c) => ({ ...p, ...(c.indexOf('>') === 0 ? { [this.ancestoryWithSelf$.value.map((v, k) => (k+1) % 2 === 0 ? `.pane-${v}` : `.panel-${v}`).join(' ') + ' ' + c]: classes[c] } : { [c]: classes[c] }) }), {});
      return { css: { children: rebuiltCss }, classes: rebuiltClasses };
    }),
    delay(1)
  ).subscribe(({ css, classes }) => {
    /*console.log(`matched css inside panel renderer: ${this.indexPosition}`);
    console.log(css);
    this.filteredCss = css;*/
    console.log('classes', classes);
    const keys = Object.keys(css.children).filter(k => k === '' || isSelectorValid({ selector: k, document: this.document }));
    const classKeys = Object.keys(classes).filter(k => k === '' || isSelectorValid({ selector: k, document: this.document }));
    classKeys.forEach((k, keyIndex) => {
      const matchedNodes = k === '' ? [ this.hostEl.nativeElement ] : k.indexOf('>') !== -1 ? this.document.querySelectorAll(k) : this.hostEl.nativeElement.querySelectorAll(k);
      const len = matchedNodes.length;
      for (let i = 0; i < len; i++) {
        const c = classes[classKeys[keyIndex]];
        const cKeys = Object.keys(c);
        const cLen = cKeys.length;
        for (let j = 0; j < cLen; j++) {
          if (matchedNodes[i]) {
            if (c[cKeys[j]] === ClassClassification.REMOVE) {
              console.log(`remove class ${cKeys[j]}`);
              this.renderer2.removeClass(matchedNodes[i], cKeys[j]);
            } else {
              console.log(`add class ${cKeys[j]}`);
              this.renderer2.addClass(matchedNodes[i], cKeys[j]);
            }
          }
        }
      }
    });
    keys.forEach(k => {
      console.log(`search: ${k}`);
      const matchedNodes = k === '' ? [ this.hostEl.nativeElement ] : k.indexOf('>') !== -1 ? this.document.querySelectorAll(k) : this.hostEl.nativeElement.querySelectorAll(k);
      const len = matchedNodes.length;
      const rules = Object.keys(css.children[k].attributes);
      for (let i = 0; i < len; i++) {
        if (matchedNodes[i]) {
          rules.forEach(p => {
            console.log(`${k} { ${p}: ${css.children[k].attributes[p]}; }`);
            const prop = camelize(p.replace('-', '_'), false); // @todo: Not working for custom sheet 
            this.renderer2.setStyle(matchedNodes[i], /*p*/ prop, css.children[k].attributes[p]);
          });
        }
      }
    });
  });

  readonly listeners$ = new BehaviorSubject<Array<InteractionListener>>([]);
  readonly listenersSub = this.listeners$.pipe(
    tap(listeners => {
      console.log('panel listeners', listeners);
      this.filteredListeners = listeners;
    })
  ).subscribe();
  

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

  get panesArray(): UntypedFormArray {
    return this.panelForm.get('panes') as UntypedFormArray;
  }

  constructor(
    // @Inject(STYLE_PLUGIN) stylePlugins: Array<StylePlugin>,
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private hostEl: ElementRef,
    private renderer2: Renderer2,
    private componentFactoryResolver: ComponentFactoryResolver,
    private fb: UntypedFormBuilder,
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

  validate(c: AbstractControl): Observable<ValidationErrors | null> {
    /*return this.panelForm.statusChanges.pipe(
      startWith(this.panelForm.status),  // start with the current form status
      filter((status) => status === 'VALID'),
      map(() => null),
      timeout(1000),
      catchError(() => of({ invalidForm: {valid: false, message: "panel are invalid"}})),
      first()
    );*/
    return this.panelForm.statusChanges.pipe(
      startWith(this.panelForm.status),  // start with the current form status
      filter((status) => status !== 'PENDING'),
      debounceTime(1),
      take(1), // We only want one emit after status changes from PENDING
      map((status) => {
          return this.panelForm.valid ? null : { invalidForm: {valid: false, message: "panel are invalid"}}; // I actually loop through the form and collect the errors, but for validity just return this works fine
      })
    );
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