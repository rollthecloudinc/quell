import { Component, OnInit, Inject, ViewChild, Output, EventEmitter, Input, ViewChildren, QueryList, ElementRef, OnChanges, SimpleChanges, TemplateRef, ContentChild, forwardRef, ComponentFactoryResolver, ComponentRef, AfterContentInit, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, UntypedFormBuilder, Validator, Validators, AbstractControl, ValidationErrors, UntypedFormArray, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import * as uuid from 'uuid';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ContentSelectorComponent } from '../content-selector/content-selector.component';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { ContentPlugin, CONTENT_PLUGIN, ContentBinding, ContentPluginManager, ContentPluginEditorOptions } from '@rollthecloudinc/content';
import { PanelsEditor, LayoutSetting, PanelContentHandler, PanelsContextService, Pane, PanelPage, LayoutEditorBaseComponent, StylePlugin, StylePluginManager, STYLE_PLUGIN, PageBuilderFacade, PropertiesFormPayload, PanelPropsFormPayload, PanePropsFormPayload } from '@rollthecloudinc/panels';
import { TokenizerService } from '@rollthecloudinc/token';
import { SITE_NAME } from '@rollthecloudinc/utils';
// import { STYLE_PLUGIN } from '@rollthecloudinc/style';
import { /*ContextManagerService,*/ ContextPluginManager, InlineContext } from '@rollthecloudinc/context';
import { SplitLayoutComponent, GridLayoutComponent, LayoutPluginManager } from '@rollthecloudinc/layout';
import { MatDialog } from '@angular/material/dialog';
import { PersistenceDialogComponent, PersistenceFormPayload } from '@rollthecloudinc/refinery';
import { DisplayGrid, GridsterConfig, GridType, GridsterItem, GridsterItemComponentInterface } from 'angular-gridster2';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { RenderingEditorComponent } from '../rendering-editor/rendering-editor.component';
import { Observable, forkJoin, iif, of, BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { debounceTime, delay, filter, map, tap, switchMap, take } from 'rxjs/operators';
// import { PanelContentHandler } from '../../handlers/panel-content.handler';
import { StyleSelectorComponent } from '../style-selector/style-selector.component';
import { RulesDialogComponent } from '../rules-dialog/rules-dialog.component';
import { Rule as NgRule } from '@rollthecloudinc/ngx-angular-query-builder';
import { PropertiesDialogComponent } from '../properties-dialog/properties-dialog.component';
import { ContextDialogComponent } from '../context-dialog/context-dialog.component';
import { PanelPropsDialogComponent } from '../panel-props-dialog/panel-props-dialog.component';
import { PanePropsDialogComponent } from '../pane-props-dialog/pane-props-dialog.component';
import { NgTemplateOutlet } from '@angular/common';
// import { timeStamp } from 'console';
// import { InlineContextResolverService } from '../../services/inline-context-resolver.service';
import { LayoutEditorHostDirective } from '../../directives/layout-editor-host.directive';
import { paneStateContextFactory } from '../../pages.factories';
import { PaneStateContextResolver } from '../../contexts/pane-state-context.resolver';
import { PaneContentHostDirective } from '../../directives/pane-content-host.directive';
import { InteractionsDialogComponent, InteractionsFormPayload } from '@rollthecloudinc/detour';

/**
 * Putting render pane inside the same file is a documented work around for the
 * below angular partial compilation issue.
 * 
 * https://angular.io/errors/NG3003
 */
@Component({
  selector: 'classifieds-ui-editable-pane',
  templateUrl: './editable-pane.component.html',
  styleUrls: ['./editable-pane.component.scss']
})
export class EditablePaneComponent implements OnInit, OnChanges {

  @Input()
  pluginName: string;

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  name: string;

  @Input()
  label: string;

  @Input()
  set panelIndex(panelIndex: number) {
    this.panelIndex$.next(panelIndex);
  }

  @Input()
  set paneIndex(paneIndex: number) {
    this.paneIndex$.next(paneIndex);
  }

  @Input()
  locked = false;

  @Input()
  rootContext: InlineContext;

  @Input()
  contexts: Array<InlineContext> = [];

  @Input() 
  set ancestory(ancestory: Array<number>) {
    this.ancestory$.next(ancestory);
  }

  @Output()
  edit = new EventEmitter();

  @Output()
  props = new EventEmitter();

  @Output()
  delete = new EventEmitter();

  @Output()
  rules = new EventEmitter();

  @Output()
  rendererOverride = new EventEmitter();

  @Output()
  removeRendererOverride = new EventEmitter();

  @Output()
  nestedUpdate = new EventEmitter<PanelPage>();

  @Output()
  heightChange = new EventEmitter();

  displayOverride = false;
  hasOverride = false;

  contentPlugin: ContentPlugin;

  preview = false;

  // private contentPlugins: Array<ContentPlugin> = [];

  private schedulePluginChange = new Subject<boolean>();
  private pluginChangeSub = this.schedulePluginChange.pipe(
    switchMap(init => this.cpm.getPlugin(this.pluginName).pipe(
      switchMap(p => p.handler.hasRendererOverride(this.settings).pipe(
        map<boolean, [boolean, ContentPlugin<string>, boolean]>(r => [init, p, r])
      ))
    ))
  ).subscribe(([init, p, r]) => {
    this.contentPlugin = p;
    this.displayOverride = p.handler.implementsRendererOverride();
    this.hasOverride = !!r;
    if(init && this.pluginName === 'panel') {
      this.panelHandler.toObject(this.settings).subscribe(p => {
        this.panelPage = p;
      });
    }
  });

  panelPage: PanelPage;
  ancestory$ = new Subject<Array<number>>();
  panelIndex$ = new Subject<number>();
  paneIndex$ = new Subject<number>();
  paneAncestoryWithSelf: Array<number> = [];

  @ViewChild(PaneContentHostDirective, { static: false }) contentPaneHost: PaneContentHostDirective;
  @ViewChild('contentEditor', { static: false }) contentEditor: any;

  paneAncestoryWithSelfSub = combineLatest([
    this.ancestory$,
    this.panelIndex$,
    this.paneIndex$
  ]).pipe(
    map(([ancestory, panelIndex, paneIndex]) => [...ancestory, panelIndex, paneIndex])
  ).subscribe(a => {
    this.paneAncestoryWithSelf = a;
  });

  constructor(
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    private componentFactoryResolver: ComponentFactoryResolver,
    private panelHandler: PanelContentHandler,
    private cpm: ContentPluginManager
  ) {
    // this.contentPlugins = contentPlugins;
  }

  ngOnInit(): void {
    this.schedulePluginChange.next(true);
    console.log('here 1');
    /*this.contentPlugin = this.contentPlugins.find(p => p.name === this.pluginName);
    this.displayOverride = this.contentPlugin.handler.implementsRendererOverride();
    this.contentPlugin.handler.hasRendererOverride(this.settings).subscribe(r => this.hasOverride = !!r);
    if(this.pluginName === 'panel') {
      this.panelHandler.toObject(this.settings).subscribe(p => {
        this.panelPage = p;
      });
    }*/
  }

  ngOnChanges(changes: SimpleChanges) {
    this.schedulePluginChange.next(false);
    console.log('here 2');
    console.log(changes);
    /*this.contentPlugin = this.contentPlugins.find(p => p.name === this.pluginName);
    this.displayOverride = this.contentPlugin.handler.implementsRendererOverride();
    this.contentPlugin.handler.hasRendererOverride(this.settings).subscribe(r => this.hasOverride = !!r);*/
  }

  onEditClick() {
    this.edit.emit();
  }

  onPropsClick() {
    this.props.emit();
  }

  onRulesClick() {
    this.rules.emit();
  }

  onDeleteClick() {
    this.delete.emit();
  }

  onPreviewClick() {
    this.preview = true;
    if(this.contentPaneHost !== undefined) {
      this.renderPaneContent();
    }
    setTimeout(() => this.heightChange.emit());
  }

  onOverrideClick() {
    this.rendererOverride.emit();
  }

  onRemoveOverrideClick() {
    this.removeRendererOverride.emit();
  }

  onNestedUpdate(panelPage: PanelPage) {
    this.nestedUpdate.emit(panelPage);
  }

  onDisablePreviewClick() {
    this.preview = false;
    if(this.contentPaneHost !== undefined) {
      const viewContainerRef = this.contentPaneHost.viewContainerRef;
      viewContainerRef.clear();
    }
    setTimeout(() => this.heightChange.emit());
  }

  onAfterCollapse() {
    this.heightChange.emit();
  }

  onAfterExpand() {
    this.heightChange.emit();
  }

  renderPaneContent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.contentPlugin.renderComponent);

    const viewContainerRef = this.contentPaneHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as any).settings = this.settings;
  }

}
@Component({
  selector: 'classifieds-ui-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContentEditorComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ContentEditorComponent),
      multi: true
    },
  ]
})
export class ContentEditorComponent implements OnInit, OnChanges, AfterContentInit, AfterViewInit, ControlValueAccessor, Validator, PanelsEditor {

  @Output()
  submitted = new EventEmitter<PanelPage>();

  @Output()
  nestedUpdate = new EventEmitter<PanelPage>();

  @Output()
  delete = new EventEmitter();

  @Output()
  rules = new EventEmitter();

  @Output()
  props = new EventEmitter();

  @Input()
  panelPage: PanelPage;
  /*set panelPage(panelPage: PanelPage) {
    if(panelPage !== undefined) {
      this.panelPageId = panelPage.id;
      this.dashboard = [ ...panelPage.gridItems ];
      panelPage.panels.forEach((p, i) => {
        this.panels.push(this.fb.group({
          panes: this.fb.array([])
        }));
        p.panes.forEach((pp, i2) => {
          (this.panels.at(i).get('panes') as FormArray).push(this.fb.group({
            contentPlugin: pp.contentPlugin,
            name: new FormControl(pp.name),
            label: new FormControl(pp.label),
            settings: new FormArray(pp.settings.map(s => this.convertToGroup(s)))
          }));
        });

      });
    } else {
      this.panelPageId = undefined;
      (this.contentForm.get('panels') as FormArray).clear();
    }
  }*/

  @Input()
  savable = true;

  @Input()
  nested = false;

  @Input()
  locked = false;

  @Input()
  pageBuilder = false;

  @Input()
  contexts: Array<InlineContext> = [];

  @Input()
  rootContext: InlineContext;

  @Input()
  set ancestory(ancestory: Array<number>) {
    this.ancestory$.next(ancestory);
  }
  get ancestory(): Array<number> {
    return this.ancestory$.value;
  }

  layoutEditorRef: ComponentRef<LayoutEditorBaseComponent>;

  contentAdded = new Subject<[number, number]>();
  contentAdddedSub = this.contentAdded.subscribe(([panelIndex, paneIndex]) => {
    this.resolvePaneContexts(panelIndex, paneIndex);
  });

  panelPageId: string;
  dashboard = [];

  pageProperties = new PropertiesFormPayload();
  persistence = new PersistenceFormPayload();
  interactions = new InteractionsFormPayload();

  layoutSetting = new LayoutSetting();
  rowSettings: Array<LayoutSetting> = [];

  ancestory$ = new BehaviorSubject<Array<number>>([]);

  public onTouched: () => void = () => {};

  contentForm = this.fb.group({
    name: this.fb.control(''),
    title: this.fb.control(''),
    layoutType: this.fb.control('split', Validators.required),
    displayType: this.fb.control('page', Validators.required),
    panels: this.fb.array([])
  });

  options: GridsterConfig = {
    gridType: GridType.Fit,
    displayGrid: DisplayGrid.Always,
    pushItems: true,
    draggable: {
      enabled: true
    },
    resizable: {
      enabled: true
    },
    mobileBreakpoint: 0,
    itemChangeCallback: (item: GridsterItem, itemComponent: GridsterItemComponentInterface) => {
      // console.log(item);
    },
    itemInitCallback: (item: GridsterItem, itemComponent: GridsterItemComponentInterface) => {
      if(this.nested && item.y !== 0) {
        const matchIndex = this.gridLayout.grid.findIndex(g => g.x === item.x && g.y === item.y && g.cols === item.cols && g.rows === item.rows);
        if(this.panelPanes(matchIndex).length === 0) {
          this.gridLayout.setItemContentHeight(matchIndex, 200);
        } else {
        }
      }
    },
  };

  //private contentPlugins: Array<ContentPlugin> = [];
  //private contentPlugins: Map<string, ContentPlugin<string>>;

  // private stylePlugins: Array<StylePlugin> = [];

  @ViewChild(GridLayoutComponent, {static: false}) gridLayout: GridLayoutComponent;
  @ViewChild(SplitLayoutComponent, {static: false}) splitLayout: SplitLayoutComponent;

  @ViewChildren('panes') paneContainers: QueryList<ElementRef>;
  @ViewChildren(EditablePaneComponent) editablePanes: QueryList<EditablePaneComponent>;

  @ViewChild(LayoutEditorHostDirective, { static: false }) layoutEditorHost: LayoutEditorHostDirective;

  @ViewChild('contextsMenuTpl', { static: true }) contextsMenuTpl: TemplateRef<any>;
  @ViewChild('editablePaneTpl', { static: true }) editablePaneTpl: TemplateRef<any>;
  @ContentChild('extraActionsArea') extraActionsAreaTmpl: TemplateRef<any>;

  ancestorySub = this.ancestory$.pipe(
    filter(() => !!this.layoutEditorRef)
  ).subscribe(ancestory => {
    (this.layoutEditorRef.instance as any).ancestory = ancestory;
  });

  get panels() {
    return (this.contentForm.get('panels') as UntypedFormArray);
  }

  get layoutType() {
    return this.contentForm.get('layoutType');
  }

  get displayType() {
    return this.contentForm.get('displayType');
  }

  get columnSettings(): Array<LayoutSetting> {
    const panelLen = this.panels.length;
    let settings: Array<LayoutSetting> = [];
    for(let i = 0; i < panelLen ;i++) {
      settings = [ ...settings, new LayoutSetting(this.panels.at(i).get('columnSetting').value) ];
    }
    return settings;
  }

  constructor(
    //@Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    // @Inject(STYLE_PLUGIN) stylePlugins: Array<StylePlugin>,
    @Inject(SITE_NAME) private siteName: string,
    private cpm: ContentPluginManager,
    private spm: StylePluginManager,
    private lpm: LayoutPluginManager,
    private cxtm: ContextPluginManager,
    private fb: UntypedFormBuilder,
    private bs: MatBottomSheet,
    private dialog: MatDialog,
    private panelHandler: PanelContentHandler,
    private tokenizerService: TokenizerService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private pageBuilderFacade: PageBuilderFacade,
    private paneStateContextResolver: PaneStateContextResolver,
    private panelsContextService: PanelsContextService
    // private contextManager: ContextManagerService
  ) {
    //this.contentPlugins = contentPlugins;
    // this.stylePlugins = stylePlugins;
  }

  ngOnInit(): void {
    this.contentForm.valueChanges.pipe(
      filter(() => this.nested),
      debounceTime(500)
    ).subscribe(() => {
      //console.log('nested update');
      this.nestedUpdate.emit(this.packageFormData());
    });
    this.contentForm.get('layoutType').valueChanges.pipe(
      filter(v => v === 'gridless'),
      delay(1)
    ).subscribe(v => {
      if(this.panels.length === 0) {
        this.panels.push(this.fb.group({
          name: new UntypedFormControl(''),
          label: new UntypedFormControl(''),
          stylePlugin: new UntypedFormControl(''),
          styleTitle: new UntypedFormControl(''),
          settings: new UntypedFormArray([]),
          panes: this.fb.array([]),
          columnSetting: this.fb.group({
            settings: this.fb.array([])
          })
        }));
      }
    });
    this.contentForm.valueChanges.pipe(
      filter(() => !this.nested),
      debounceTime(500)
    ).subscribe(() => {
      const pp = this.packageFormData();
      this.pageBuilderFacade.setPage(pp);
    });
  }

  ngAfterViewInit() {
    this.layoutType.valueChanges.pipe(
      filter(() => !!this.layoutEditorHost)
    ).subscribe(v => {
      this.renderEditorLayout(v);
    });
    if (this.layoutType.value) {
      this.renderEditorLayout(this.layoutType.value);
    }
  }

  ngAfterContentInit() {
    setTimeout(() => {
      if (!this.panelPage) {
        this.contentForm.get('layoutType').setValue('split');
      }
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.panelPage && changes.panelPage.previousValue !== changes.panelPage.currentValue) {
      this.panels.clear();
      this.panelPageId = changes.panelPage.currentValue.panelPageId;
      this.dashboard = changes.panelPage.currentValue.gridItems.map(o => Object.assign({}, o));
      this.layoutType.setValue(changes.panelPage.currentValue.layoutType);
      this.layoutSetting = new LayoutSetting(changes.panelPage.currentValue.layoutSetting);
      this.rowSettings = changes.panelPage.currentValue.rowSettings ? changes.panelPage.currentValue.rowSettings.map(rs => new LayoutSetting(rs)) : [];
      this.persistence = changes.panelPage.currentValue.persistence ? new PersistenceFormPayload(changes.panelPage.currentValue.persistence) : new PersistenceFormPayload();
      this.interactions = changes.panelPage.currentValue.interactions ? new InteractionsFormPayload(changes.panelPage.currentValue.interactions) : new InteractionsFormPayload();
      if(!this.nested) {
        this.pageProperties = new PropertiesFormPayload({ name: changes.panelPage.currentValue.name, title: changes.panelPage.currentValue.title, path: changes.panelPage.currentValue.path, readUserIds: changes.panelPage.currentValue.entityPermissions.readUserIds, cssFile: changes.panelPage.currentValue.cssFile });
        this.contexts = changes.panelPage.currentValue.contexts;
      } else {
        this.pageProperties = new PropertiesFormPayload({ name: changes.panelPage.currentValue.name, title: changes.panelPage.currentValue.title, path: '', readUserIds: [], cssFile: '' });
        this.contentForm.get('name').setValue(changes.panelPage.currentValue.name);
        this.contentForm.get('title').setValue(changes.panelPage.currentValue.title);
      }
      changes.panelPage.currentValue.panels.forEach((p, i) => {
        this.panels.push(this.fb.group({
          name: new UntypedFormControl(p.name),
          label: new UntypedFormControl(p.label),
          stylePlugin: new UntypedFormControl(p.stylePlugin),
          styleTitle: new UntypedFormControl(''),
          settings: this.fb.array(p.settings !== undefined ? p.settings.map(s => this.convertToGroup(s)): []),
          panes: this.fb.array([]),
          columnSetting: this.fb.group({
            settings: this.fb.array(p.columnSetting ? p.columnSetting.settings.map(s => this.convertToGroup(s)) : [])
          })
        }));
        if(p.stylePlugin && p.stylePlugin !== '') {
          this.spm.getPlugin(p.stylePlugin).subscribe(p => {
            this.panels.at(i).get('styleTitle').setValue(p.title);
          });
        }
        if(this.nested) {
          this.panelPanes(this.panels.length - 1).valueChanges.pipe(
            debounceTime(5),
            delay(1)
          ).subscribe(((panelIndex) => {
            return () => {
              if(this.gridLayout !== undefined) {
                const container = this.paneContainers.find((i, index) => index === panelIndex);
                this.gridLayout.setItemContentHeight(panelIndex, container.nativeElement.offsetHeight);
              }
            };
          })(this.panels.length - 1));
        }
        p.panes.forEach((pp, i2) => {
          (this.panels.at(i).get('panes') as UntypedFormArray).push(this.fb.group({
            contentPlugin: pp.contentPlugin,
            name: new UntypedFormControl(pp.name),
            label: new UntypedFormControl(pp.label),
            locked: new UntypedFormControl(pp.locked),
            linkedPageId: new UntypedFormControl(pp.linkedPageId),
            rule: new UntypedFormControl(pp.rule && pp.rule !== null  ? { ...pp.rule, rules: pp.rule.rules && Array.isArray(pp.rule.rules) ? pp.rule.rules : [] } : { condition: '', rules: [] }),// new FormControl(pp.rule && pp.rule !== null ? { ...pp.rule, rules: [ ...( pp.rules && pp.rules !== null ? pp.rules : [] ) ] } : ''),
            // rule: new FormControl({ condition: '', rules: [] }),
            settings: new UntypedFormArray(pp.settings.map(s => this.convertToGroup(s)))
          }));
          setTimeout(() => this.resolvePaneContexts(i, i2));
        });
      });
      if(this.layoutEditorRef) {
        (this.layoutEditorRef.instance as any).layoutSetting = this.layoutSetting;
        (this.layoutEditorRef.instance as any).rowSettings = this.rowSettings;
        (this.layoutEditorRef.instance as any).columnSettings = this.columnSettings;
      }
    }
  }

  addContent(index: number) {

    console.log(this.panels.at(index));
    this.pageBuilderFacade.getPage$.pipe(
      switchMap(pp => this.panelsContextService.allActivePageContexts({ panelPage: pp })),
      take(1)
    ).subscribe(paneContexts => {
      this.bs.open(ContentSelectorComponent, { data: {  panelForm: this.panels.at(index), panelIndex: index, contexts: [ ...( this.rootContext ? [ this.rootContext ] : [] ), ...this.contexts, ...paneContexts ] } });
    });
  }

  editPanelProps(panelIndex: number) {
    const name = this.panels.at(panelIndex).get('name');
    const label = this.panels.at(panelIndex).get('label');
    this.dialog
      .open(PanelPropsDialogComponent, { data: { props: new PanelPropsFormPayload({ name: name.value, label: label.value }) } })
      .afterClosed()
      .subscribe((props: PanelPropsFormPayload) => {
        if(props) {
          name.setValue(props.name);
          label.setValue(props.label);
        }
      });
  }

  editPaneProps(panelIndex: number, paneIndex: number) {
    const name = this.panelPane(panelIndex, paneIndex).get('name');
    const label = this.panelPane(panelIndex, paneIndex).get('label');
    this.dialog
      .open(PanePropsDialogComponent, { data: { props: new PanePropsFormPayload({ name: name.value, label: label.value }) } })
      .afterClosed()
      .subscribe((props: PanePropsFormPayload) => {
        if(props) {
          name.setValue(props.name);
          label.setValue(props.label);
        }
      });
  }

  applyStyle(index: number) {
    this.bs.open(StyleSelectorComponent, { data: { panelForm: this.panels.controls[index], panelIndex: index, contexts: this.contexts } });
  }

  removeStyle(index: number) {
    this.panels.controls[index].get('stylePlugin').setValue('');
    this.panels.controls[index].get('styleTitle').setValue('');
  }

  onItemAdded() {
    console.log('item added');

    this.panels.push(this.fb.group({
      name: new UntypedFormControl(''),
      label: new UntypedFormControl(''),
      stylePlugin: new UntypedFormControl(''),
      styleTitle: new UntypedFormControl(''),
      settings: new UntypedFormArray([]),
      panes: this.fb.array([]),
      columnSetting: this.fb.group({
        settings: this.fb.array([])
      })
    }));

    if(this.nested && this.gridLayout !== undefined) {
      setTimeout(() => {
        this.paneContainers.forEach((p, i) => {
          this.gridLayout.setItemContentHeight(i, p.nativeElement.offsetHeight);
        });
      });
    }

    this.panelPanes(this.panels.length - 1).valueChanges.pipe(
      filter(() => this.nested && this.gridLayout !== undefined),
      debounceTime(5),
      delay(1)
    ).subscribe(((panelIndex) => {
      return () => {
        const container = this.paneContainers.find((i, index) => index === panelIndex);
        this.gridLayout.setItemContentHeight(panelIndex, container.nativeElement.offsetHeight);
      };
    })(this.panels.length - 1));

    if (this.layoutEditorRef) {
      (this.layoutEditorRef.instance as any).columnSettings = this.columnSettings;
    }
  }

  onItemRemoved(index: number) {
    this.panels.removeAt(index);

    if(this.nested && this.gridLayout !== undefined) {
      setTimeout(() => {
        this.paneContainers.forEach((p, i) => {
          this.gridLayout.setItemContentHeight(i, p.nativeElement.offsetHeight);
        });
      });
    }

    if (this.layoutEditorRef) {
      (this.layoutEditorRef.instance as any).columnSettings = this.columnSettings;
    }
  }

  onDrop(evt: CdkDragDrop<string[]>) {

    console.log(evt);

    const newPanelIndex = +evt.container.data;
    const oldPanelIndex = +evt.previousContainer.data;

    if(newPanelIndex === oldPanelIndex) {
      const dir = evt.currentIndex > evt.previousIndex ? 1 : -1;

      const from = evt.previousIndex;
      const to = evt.currentIndex;

      const temp = this.panelPanes(newPanelIndex).at(from);
      for (let i = from; i * dir < to * dir; i = i + dir) {
        const current = this.panelPanes(newPanelIndex).at(i + dir);
        this.panelPanes(newPanelIndex).setControl(i, current);
      }
      this.panelPanes(newPanelIndex).setControl(to, temp);
    } else {
      const temp = this.panelPanes(oldPanelIndex).at(evt.previousIndex);
      this.panelPanes(oldPanelIndex).removeAt(evt.previousIndex);
      this.panelPanes(newPanelIndex).insert(evt.currentIndex, temp);
    }

  }

  onOverrideRenderer(index: number, index2: number) {
    const pane = new Pane(this.panelPane(index, index2).value);
    this.dialog.open(RenderingEditorComponent, { data: { panelFormGroup: this.panels.at(index), paneIndex: index2, pane } });
  }

  onRemoveOverrideRenderer(index: number, index2: number) {
    const formArray = this.panelPane(index, index2).get('settings') as UntypedFormArray;
    let rendererIndex;
    formArray.controls.forEach((c, i) => {
      if(c.get('name').value === '_renderer') {
        rendererIndex = i;
      }
    });
    if(rendererIndex !== undefined) {
      formArray.removeAt(rendererIndex);
    }
  }

  onNestedUpdate(panelPage: PanelPage, index: number, index2: number) {
    const settings = this.panelHandler.buildSettings(panelPage);
    const formArray = (this.panelPane(index, index2).get('settings') as UntypedFormArray);
    formArray.clear();
    settings.forEach(s => formArray.push(this.convertToGroup(s)))
  }

  onPaneHeightChange(panelIndex: number) {
    if(this.nested && this.gridLayout) {
      const container = this.paneContainers.find((i, index) => index === panelIndex);
      this.gridLayout.setItemContentHeight(panelIndex, container.nativeElement.offsetHeight);
    }
  }

  onDeleteClick() {
    this.delete.emit();
  }

  onRulesClick() {
    this.rules.emit();
  }

  /*onPropsClick() {
    this.props.emit();
  }*/

  onPropertiesClick() {
    this.props.emit();
    this.dialog
    .open(PropertiesDialogComponent, { data: { props: this.pageProperties } })
    .afterClosed()
    .subscribe((props: PropertiesFormPayload) => {
      if(props) {
        this.pageProperties = new PropertiesFormPayload({ ...props });
        this.contentForm.get('name').setValue(props.name);
        this.contentForm.get('title').setValue(props.title);
      }
    });
  }

  /*onRulesPane(index: number, index2: number) {
    const pane = new Pane(this.panelPane(index, index2).value);
    const rule = this.panelPane(index, index2).get('rule').value !== '' ? this.panelPane(index, index2).get('rule').value as NgRule : undefined;

    const bindings$: Array<Observable<[number, Array<ContentBinding>]>> = [];
    this.panelPanes(index).controls.forEach((c, i) => {
      if(i !== index2) {
        const pane = new Pane({ ...c.value });
        const plugin = this.contentPlugins.find(p => p.name === pane.contentPlugin);
        if(plugin.handler !== undefined && plugin.handler.isDynamic(pane.settings)) {
          bindings$.push(plugin.handler.getBindings(pane.settings, 'pane').pipe(
            map(bindings => [i, bindings])
          ));
        }
      }
    });

    if(bindings$.length !== 0) {
      forkJoin(bindings$).pipe(
        map(pb => pb.reduce<Array<number>>((p, [i, b]) => [ ...p, ...(b.findIndex(cb => cb.type === 'pane' && cb.id === pane.name) > -1 ? [ i ] : []) ], [])),
        map(indexes => indexes.length === 0 ? undefined : indexes[0]),
        switchMap(i => iif(
          () => i !== undefined,
          this.contentPlugins.find(c => c.name === new Pane({ ...this.panelPane(index, i).value }).contentPlugin).handler.fetchDynamicData(new Pane({ ...this.panelPane(index, i).value }).settings, new Map<string, any>([ ['tag', uuid.v4()], ['contexts', [ ...this.contexts ]] ])),
          of(new Dataset())
        ))
      ).subscribe(dataset => {
        const contexts = [ ...(dataset.results.length > 0 ? [ ...this.contexts, new InlineContext({ name: '_root', adaptor: 'data', data: dataset.results[0] })] : this.contexts) ];
        this.dialog
          .open(RulesDialogComponent, { data: { rule, contexts } })
          .afterClosed()
          .subscribe(r => {
            this.panelPane(index, index2).get('rule').setValue(r ? r : rule ? rule : undefined);
          });
      });
    } else {
      console.log(this.contexts);
      this.dialog
      .open(RulesDialogComponent, { data: { rule, contexts: [ ...(this.rootContext ? [ this.rootContext ] : [] ), ...this.contexts ] } })
      .afterClosed()
      .subscribe(r => {
        this.panelPane(index, index2).get('rule').setValue(r ? r : rule ? rule : undefined);
      });
    }

  }*/

  onRulesPane(index: number, index2: number) {
    const pane = new Pane(this.panelPane(index, index2).value);
    const rule = this.panelPane(index, index2).get('rule').value !== '' ? this.panelPane(index, index2).get('rule').value as NgRule : undefined;
    const [ editablePane ] = this.editablePanes.filter((ep, i) => ep.name === pane.name );
    this.pageBuilderFacade.getPage$.pipe(
      tap(() => {
        this.pageBuilderFacade.setSelectionPath([ ...this.ancestory, index, index2 ]);
      }),
      switchMap(pp => this.panelsContextService.allActivePageContexts({ panelPage: pp })),
      switchMap(paneContexts => this.dialog
        .open(RulesDialogComponent, { data: { rule, contexts: [ ...( editablePane.rootContext ? [ editablePane.rootContext ] : this.rootContext ? [ this.rootContext ] : [] ), ...this.contexts, ...paneContexts ] } })
        .afterClosed()
      ),
      take(1)
    ).subscribe(r => {
      this.panelPane(index, index2).get('rule').setValue(r ? r : rule ? rule : undefined);
    });
  }

  onDeletePane(index: number, index2: number) {
    console.log(`delete nested pane: ${index} | ${index2}`);
  }

  onAddContextClick() {
    const pp = this.packageFormData();
    this.pageBuilderFacade.setPage(pp);
    this.dialog.open(ContextDialogComponent, { data: { } })
    .afterClosed()
    .subscribe((context?: InlineContext) => {
      if(context) {
        this.contexts = [ ...this.contexts, context ];
      }
    });
  }

  onEditContext(name: string) {
    const editContext = this.contexts.find(c => c.name === name);
    console.log(editContext);
    if(editContext) {
      const pp = this.packageFormData();
      this.pageBuilderFacade.setPage(pp);
      this.dialog.open(ContextDialogComponent, { data: { context: editContext } })
      .afterClosed()
      .subscribe((context?: InlineContext) => {
        if(context) {
          this.contexts = this.contexts.map(c => c.name === name ? new InlineContext(context) : c);
        }
      });
    }
  }

  onLayoutSettingChange(evt: LayoutSetting) {
    this.layoutSetting = new LayoutSetting(evt);
    if (this.nested) {
      this.nestedUpdate.emit(this.packageFormData());
    }
    if (this.layoutEditorRef) {
      (this.layoutEditorRef.instance as any).layoutSetting = this.layoutSetting;
    }
  }

  onRowSettingsChange(evt: Array<LayoutSetting>) {
    this.rowSettings = evt.map(s => new LayoutSetting(s));
    if (this.nested) {
      this.nestedUpdate.emit(this.packageFormData());
    }
    if (this.layoutEditorRef) {
      (this.layoutEditorRef.instance as any).rowSettings = this.rowSettings;
    }
  }

  onColumnSettingsChange(evt: Array<LayoutSetting>) {
    const len = this.panels.length;
    for(let i = 0; i < len; i++) {
      (this.panels.at(i).get('columnSetting').get('settings') as UntypedFormArray).clear();
      for (let j = 0; j < evt[i].settings.length; j++) {
        (this.panels.at(i).get('columnSetting').get('settings') as UntypedFormArray).push(this.convertToGroup(evt[i].settings[j]));
      }
    }
    if (this.nested) {
      this.nestedUpdate.emit(this.packageFormData());
    }
    if (this.layoutEditorRef) {
      (this.layoutEditorRef.instance as any).columnSettings = this.columnSettings;
    }
  }

  submit() {
    this.submitted.emit(this.packageFormData());
  }

  packageFormData(): PanelPage {
    //this.syncNestedPanelPages();
    const gridItems = this.layoutEditorRef.instance.gridItems;
    /*switch(this.layoutType.value) {
      case 'grid':
        gridItems = this.gridLayout.grid.map((gi, i) => ({ ...gi, weight: i }));
        break;
      case 'split':
        // gridItems = this.splitLayout.dashboard.map((gi, i) => ({ ...gi, cols: Math.floor(gi.cols), weight: i }));
        gridItems = this.layoutEditorRef.instance.gridItems;
        break;
      default:
    }*/
    const panelPage = new PanelPage({
      id: this.panelPageId,
      title: this.pageProperties.title,
      name: this.pageProperties.name,
      site: this.siteName,
      path: this.pageProperties.path,
      cssFile: this.pageProperties.cssFile,
      displayType: this.displayType.value,
      layoutType: this.layoutType.value,
      gridItems,
      contexts: this.contexts,
      panels: this.panels.value,
      layoutSetting: new LayoutSetting(this.layoutSetting),
      rowSettings: this.rowSettings.map(rs => new LayoutSetting(rs)),
      persistence: this.persistence,
      interactions: this.interactions,
      entityPermissions: {
        readUserIds: this.pageProperties.readUserIds,
        writeUserIds: [],
        deleteUserIds: []
      }
    });
    console.log(panelPage);
    return panelPage;
  }

  syncNestedPanelPages() {
    console.log('sync nested');
    this.editablePanes.forEach(p => {
      if(p.contentEditor !== undefined) {
        const settings = this.panelHandler.buildSettings((p.contentEditor as ContentEditorComponent).packageFormData());
        const formArray = (this.panelPane(p.panelIndex, p.paneIndex).get('settings') as UntypedFormArray);
        formArray.clear();
        settings.forEach(s => formArray.push(this.convertToGroup(s)))
      }
    });
  }

  resolvePaneContexts(panelIndex: number, paneIndex: number) {
    const pane = new Pane(this.panelPane(panelIndex, paneIndex).value);
    const controls = this.panelPanes(panelIndex).controls;
    // const plugin = this.contentPlugins.find(p => p.id === pane.contentPlugin);
    this.cpm.getPlugin(pane.contentPlugin).pipe(
      filter(p => p.handler !== undefined && p.handler.isDynamic(pane.settings)),
      switchMap((p: ContentPlugin) => p.handler.fetchDynamicData(pane.settings, new Map<string, any>([ ['tag', uuid.v4()], ['contexts', [ ...this.contexts ]] ])).pipe(
        map(dataset => new InlineContext({ name: '_root', adaptor: 'data', data: dataset.length !== 0 ? dataset.results[0] : {} })),
        switchMap(context => p.handler.getBindings(pane.settings, 'pane').pipe(
          map<Array<ContentBinding>, [InlineContext, Array<number>]>(bindings => [context, bindings.map(b => controls.findIndex(p => new Pane(p.value).name === b.id))])
        ))
      ))
    ).subscribe(([context, paneIndexes]) => {
      this.editablePanes.forEach((p, i) => {
        if (paneIndexes.findIndex(pi => pi === i) > -1) {
          p.rootContext = context;
        }
      });
    });

    /*if(plugin.handler !== undefined && plugin.handler.isDynamic(pane.settings)) {
      plugin.handler.fetchDynamicData(pane.settings, new Map<string, any>([ ['tag', uuid.v4()], ['contexts', [ ...this.contexts ]] ])).pipe(
        map(dataset => new InlineContext({ name: '_root', adaptor: 'data', data: dataset.results[0] })),
        switchMap(context => plugin.handler.getBindings(pane.settings, 'pane').pipe(
          map<Array<ContentBinding>, [InlineContext, Array<number>]>(bindings => [context, bindings.map(b => controls.findIndex(p => new Pane(p.value).name === b.id))])
        ))
      ).subscribe(([context, paneIndexes]) => {
        this.editablePanes.forEach((p, i) => {
          if(paneIndexes.findIndex(pi => pi === i) > -1) {
            p.rootContext = context;
          }
        });
      })
    }*/
  }

  onPersistenceClick() {
    this.dialog.open(PersistenceDialogComponent, { data: { persistence: this.persistence, contexts: this.contexts } })
      .afterClosed()
      .subscribe((payload?: PersistenceFormPayload) => {
        console.log('persistence closed', payload);
        this.persistence = payload ? payload : this.persistence;
      });
  }

  onInteractionsClick() {
    this.dialog.open(
      InteractionsDialogComponent, 
      { 
        data: { interactions: this.interactions, contexts: this.contexts },
        ...{ maxWidth: '100vw', maxHeight: '100vh', height: '100%', width: '100%' }
      },
    )
      .afterClosed()
      .subscribe((payload?: InteractionsFormPayload) => {
        console.log('interactions closed', payload);
        this.interactions = payload ? payload : this.interactions;
      });
  }

  panelPanes(index: number): UntypedFormArray {
    return this.panels.at(index).get('panes') as UntypedFormArray;
  }

  panelPane(index: number, index2: number): UntypedFormGroup {
    return this.panelPanes(index).at(index2) as UntypedFormGroup;
  }

  panelPanePlugin(index: number, index2: number): string {
    return this.panelPane(index, index2).get('contentPlugin').value;
  }

  panelPaneSettings(index: number, index2: number): Array<AttributeValue> {
    // return this.panelPane(index, index2).get('settings').value.map(s => new AttributeValue(s));
    // console.log(this.panelPane(index, index2).get('settings').value);
    // NOTE: No that we no longer cast to a new value its possible settings can be missing props which can cause a proplem if code expewcts the actual data model.
    return this.panelPane(index, index2).get('settings').value;
  }

  panelPaneName(index: number, index2: number): string {
    return this.panelPane(index, index2).get('name').value;
  }

  panelPaneLabel(index: number, index2: number): string {
    return this.panelPane(index, index2).get('label').value;
  }

  panelPaneLocked(index: number, index2: number): boolean {
    if(this.locked) {
      return this.locked;
    }
    const locked = this.panelPane(index, index2).get('locked');
    return locked !== null ? locked.value: false;
  }

  panelPaneIsNested(index: number, index2: number): boolean {
    return this.panelPanePlugin(index, index2) === 'panel';
  }

  panelPanePanelPage(index: number, index2: number): PanelPage {
    let panelPage;
    this.panelHandler.toObject(this.panelPaneSettings(index, index2)).subscribe(p => {
      panelPage = p;
    });
    return panelPage;
  }

  hasPanelStyle(index: number) {
    return this.panels.at(index).get('stylePlugin').value !== undefined && this.panels.at(index).get('stylePlugin').value !== '';
  }

  panelStyleTitle(index: number) {
    return this.panels.at(index).get('styleTitle').value;
  }

  onPaneEdit(index: number, index2: number) {
    const pane = new Pane(this.panelPane(index, index2).value);
    const plugin = this.panelPanePlugin(index, index2);
    const [ editablePane ] = this.editablePanes.filter((ep, i) => ep.name === pane.name );
    /*const contentPlugin = this.contentPlugins.find(p => p.name === plugin);
    if(contentPlugin.editorComponent !== undefined) {
      const dialogRef = this.dialog.open(contentPlugin.editorComponent, { data: { panelFormGroup: this.panels.at(index), panelIndex: index, paneIndex: index2, contexts: this.contexts, contentAdded: this.contentAdded, pane } })
        .afterClosed()
        .subscribe(() => {
          this.resolvePaneContexts(index, index2);
        })
    }*/
            /*maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%'*/
    this.cpm.getPlugin(plugin).pipe(
      filter(p => p.editorComponent !== undefined),
      switchMap(p => this.pageBuilderFacade.getPage$.pipe(
        switchMap(pp => this.panelsContextService.allActivePageContexts({ panelPage: pp }).pipe(
          map<Iterable<InlineContext>, [ContentPlugin<string>, Iterable<InlineContext>]>(paneContexts => [p, paneContexts]),
          take(1)
        )),
        take(1)
      )),
      switchMap(([p, paneContexts]) => 
        p.handler ? 
        p.handler.editorOptions(pane.settings).pipe(
          map<ContentPluginEditorOptions, [ContentPlugin<string>, Iterable<InlineContext>, ContentPluginEditorOptions]>(editorOptions => [p, paneContexts, editorOptions])
        ):
        of<[ContentPlugin<string>, Iterable<InlineContext>, ContentPluginEditorOptions]>([p, paneContexts, new ContentPluginEditorOptions()])
      )
    ).subscribe(([p, paneContexts, editorOptions]) => {
      this.dialog.open(
        p.editorComponent,
        { data: {
          panelFormGroup: this.panels.at(index),
          panelIndex: index,
          paneIndex: index2,
          contexts: [ ...( editablePane.rootContext ? [ editablePane.rootContext ] : this.rootContext ? [ this.rootContext ] : [] ), ...this.contexts, ...paneContexts ],
          contentAdded: this.contentAdded, pane
        },
        ...( editorOptions.fullscreen ? { maxWidth: '100vw', maxHeight: '100vh', height: '100%', width: '100%' } : {} )
      })
        .afterClosed()
        .subscribe(() => {
          this.resolvePaneContexts(index, index2);
        });
    });
  }

  onPaneDelete(index: number, index2: number) {
    this.panelPanes(index).removeAt(index2);
  }

  onFileChange(event: any, index: number) {
    const file: File = event.addedFiles[0];
    // const plugin = this.contentPlugins.filter(p => p.handler !== undefined).find(p => p.handler.handlesType(file.type));
    this.cpm.getPlugins().pipe(
      map((plugins: Map<string, ContentPlugin<string>>) => Array.from(plugins.values()).filter(p => p.handler !== undefined).find(p => p.handler.handlesType(file.type))),
      filter(p => p !== undefined)
    ).subscribe(p => {
      p.handler.handleFile(file).subscribe(settings => {
        this.panelPanes(index).push(this.fb.group({
          contentPlugin: p.id,
          name: new UntypedFormControl(''),
          label: new UntypedFormControl(''),
          settings: this.fb.array(settings.map(s => this.fb.group({
            name: new UntypedFormControl(s.name, Validators.required),
            type: new UntypedFormControl(s.type, Validators.required),
            displayName: new UntypedFormControl(s.displayName, Validators.required),
            value: new UntypedFormControl(s.value, Validators.required),
            computedValue: new UntypedFormControl(s.value, Validators.required),
          })))
        }));
      });
    });
    /*if(plugin !== undefined) {
      plugin.handler.handleFile(file).subscribe(settings => {
        this.panelPanes(index).push(this.fb.group({
          contentPlugin: plugin.id,
          name: new FormControl(''),
          label: new FormControl(''),
          settings: this.fb.array(settings.map(s => this.fb.group({
            name: new FormControl(s.name, Validators.required),
            type: new FormControl(s.type, Validators.required),
            displayName: new FormControl(s.displayName, Validators.required),
            value: new FormControl(s.value, Validators.required),
            computedValue: new FormControl(s.value, Validators.required),
          })))
        }));
      });
    }*/
  }

  writeValue(val: any): void {
    if (val) {
      this.contentForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.contentForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.contentForm.disable()
    } else {
      this.contentForm.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.contentForm.valid ? null : { invalidForm: {valid: false, message: "content is invalid"}};
  }

  convertToGroup(setting: AttributeValue): UntypedFormGroup {

    const fg = this.fb.group({
      name: new UntypedFormControl(setting.name, Validators.required),
      type: new UntypedFormControl(setting.type, Validators.required),
      displayName: new UntypedFormControl(setting.displayName, Validators.required),
      value: new UntypedFormControl(setting.value, Validators.required),
      computedValue: new UntypedFormControl(setting.value, Validators.required),
      attributes: new UntypedFormArray([])
    });

    if(setting.attributes && setting.attributes.length > 0) {
      setting.attributes.forEach(s => {
        (fg.get('attributes') as UntypedFormArray).push(this.convertToGroup(s));
      })
    }

    return fg;

  }
  
  renderEditorLayout(layout: string) {

    console.log(`render editor layout ${layout}`);

    this.lpm.getPlugin(layout).subscribe(p => {

      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(p.editor);

      const viewContainerRef = this.layoutEditorHost.viewContainerRef;
      viewContainerRef.clear();
  
      this.layoutEditorRef = viewContainerRef.createComponent(componentFactory);
      (this.layoutEditorRef.instance as any).savable = this.savable;
      (this.layoutEditorRef.instance as any).nested = this.nested;
      (this.layoutEditorRef.instance as any).ancestory = this.ancestory;

      (this.layoutEditorRef.instance as any).editor = this;

      (this.layoutEditorRef.instance as any).extraActionsAreaTmpl = this.extraActionsAreaTmpl;
      (this.layoutEditorRef.instance as any).contextsMenuTpl = this.contextsMenuTpl;
      (this.layoutEditorRef.instance as any).editablePaneTpl = this.editablePaneTpl;

      (this.layoutEditorRef.instance as any).dashboard = this.dashboard;
      (this.layoutEditorRef.instance as any).layoutSetting = this.layoutSetting;
      (this.layoutEditorRef.instance as any).rowSettings = this.rowSettings;
      (this.layoutEditorRef.instance as any).columnSettings = this.columnSettings;

    });

  }

  updateEditorLayoutVars() {
      (this.layoutEditorRef.instance as any).savable = this.savable;
      (this.layoutEditorRef.instance as any).nested = this.nested;
      (this.layoutEditorRef.instance as any).ancestory = this.ancestory;

      (this.layoutEditorRef.instance as any).editor = this;

      (this.layoutEditorRef.instance as any).extraActionsAreaTmpl = this.extraActionsAreaTmpl;
      (this.layoutEditorRef.instance as any).contextsMenuTpl = this.contextsMenuTpl;
      (this.layoutEditorRef.instance as any).editablePaneTpl = this.editablePaneTpl;

      (this.layoutEditorRef.instance as any).dashboard = this.dashboard;
      (this.layoutEditorRef.instance as any).layoutSetting = this.layoutSetting;
      (this.layoutEditorRef.instance as any).rowSettings = this.rowSettings;
      (this.layoutEditorRef.instance as any).columnSettings = this.columnSettings;
  }

}