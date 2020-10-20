import { Component, OnInit, Inject, ViewChild, Output, EventEmitter, Input, ViewChildren, QueryList, ElementRef, OnChanges, SimpleChanges, TemplateRef, ContentChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormBuilder, Validator, Validators, AbstractControl, ValidationErrors, FormArray, FormControl, FormGroup } from "@angular/forms";
import * as uuid from 'uuid';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ContentSelectorComponent } from '../content-selector/content-selector.component';
import { AttributeValue } from '@classifieds-ui/attributes';
import { ContentPlugin, CONTENT_PLUGIN, ContentBinding } from '@classifieds-ui/content';
import { TokenizerService } from '@classifieds-ui/token';
import { StylePlugin, STYLE_PLUGIN } from '@classifieds-ui/style';
import { ContextManagerService } from '@classifieds-ui/context';
import { GridLayoutComponent } from '../grid-layout/grid-layout.component';
import { MatDialog } from '@angular/material/dialog';
import { Pane, PanelPage } from '../../models/page.models';
import { DisplayGrid, GridsterConfig, GridType, GridsterItem, GridsterItemComponentInterface } from 'angular-gridster2';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { RenderingEditorComponent } from '../rendering-editor/rendering-editor.component';
import { Observable, forkJoin, iif, of, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, delay, filter, map, tap, switchMap, take } from 'rxjs/operators';
import { PanelContentHandler } from '../../handlers/panel-content.handler';
import { EditablePaneComponent } from '../editable-pane/editable-pane.component';
import { StyleSelectorComponent } from '../style-selector/style-selector.component';
import { RulesDialogComponent } from '../rules-dialog/rules-dialog.component';
import { Dataset } from '../../models/datasource.models';
import { InlineContext } from '../../models/context.models';
import { Rule as NgRule } from 'angular2-query-builder';
import { SplitLayoutComponent } from '../split-layout/split-layout.component';
import { PropertiesDialogComponent } from '../properties-dialog/properties-dialog.component';
import { PropertiesFormPayload, PanelPropsFormPayload } from '../../models/form.models';
import { ContextDialogComponent } from '../context-dialog/context-dialog.component';
import { PanelPropsDialogComponent } from '../panel-props-dialog/panel-props-dialog.component';
import { timeStamp } from 'console';
import { InlineContextResolverService } from '../../services/inline-context-resolver.service';

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
export class ContentEditorComponent implements OnInit, OnChanges, ControlValueAccessor, Validator {

  @Output()
  submitted = new EventEmitter<PanelPage>();

  @Output()
  nestedUpdate = new EventEmitter<PanelPage>();

  @Output()
  delete = new EventEmitter();

  @Output()
  rules = new EventEmitter();

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

  contentAdded = new Subject<[number, number]>();
  contentAdddedSub = this.contentAdded.subscribe(([panelIndex, paneIndex]) => {
    this.resolvePaneContexts(panelIndex, paneIndex);
  });

  panelPageId: string;
  dashboard = [];

  pageProperties = new PropertiesFormPayload();

  public onTouched: () => void = () => {};

  contentForm = this.fb.group({
    layoutType: this.fb.control('grid', Validators.required),
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

  private contentPlugins: Array<ContentPlugin> = [];
  private stylePlugins: Array<StylePlugin> = [];

  @ViewChild(GridLayoutComponent, {static: false}) gridLayout: GridLayoutComponent;
  @ViewChild(SplitLayoutComponent, {static: false}) splitLayout: SplitLayoutComponent;

  @ViewChildren('panes') paneContainers: QueryList<ElementRef>;
  @ViewChildren(EditablePaneComponent) editablePanes: QueryList<EditablePaneComponent>;

  @ContentChild('extraActionsArea') extraActionsAreaTmpl: TemplateRef<any>;

  get panels() {
    return (this.contentForm.get('panels') as FormArray);
  }

  get layoutType() {
    return this.contentForm.get('layoutType');
  }

  get displayType() {
    return this.contentForm.get('displayType');
  }

  constructor(
    @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    @Inject(STYLE_PLUGIN) stylePlugins: Array<StylePlugin>,
    private fb: FormBuilder,
    private bs: MatBottomSheet,
    private dialog: MatDialog,
    private panelHandler: PanelContentHandler,
    private tokenizerService: TokenizerService,
    private contextManager: ContextManagerService
  ) {
    this.contentPlugins = contentPlugins;
    this.stylePlugins = stylePlugins;
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
      filter(v => v === 'gridless')
    ).subscribe(v => {
      if(this.panels.length === 0) {
        this.panels.push(this.fb.group({
          name: new FormControl(''),
          label: new FormControl(''),
          stylePlugin: new FormControl(''),
          settings: new FormArray([]),
          panes: this.fb.array([])
        }));
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.panelPage && changes.panelPage.previousValue !== changes.panelPage.currentValue) {
      this.panels.clear();
      this.panelPageId = changes.panelPage.currentValue.panelPageId;
      this.dashboard = [ ...changes.panelPage.currentValue.gridItems ];
      this.layoutType.setValue(this.panelPage.layoutType);
      if(!this.nested) {
        this.pageProperties = new PropertiesFormPayload({ name: changes.panelPage.currentValue.name, title: changes.panelPage.currentValue.title, path: changes.panelPage.currentValue.path });
        this.contexts = changes.panelPage.currentValue.contexts;
      }
      changes.panelPage.currentValue.panels.forEach((p, i) => {
        this.panels.push(this.fb.group({
          name: new FormControl(p.name),
          label: new FormControl(p.label),
          stylePlugin: this.fb.control(p.stylePlugin),
          settings: this.fb.array(p.settings !== undefined ? p.settings.map(s => this.convertToGroup(s)): []),
          panes: this.fb.array([])
        }));
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
          (this.panels.at(i).get('panes') as FormArray).push(this.fb.group({
            contentPlugin: pp.contentPlugin,
            name: new FormControl(pp.name),
            label: new FormControl(pp.label),
            locked: new FormControl(pp.locked),
            linkedPageId: new FormControl(pp.linkedPageId),
            rule: new FormControl(''),
            settings: new FormArray(pp.settings.map(s => this.convertToGroup(s)))
          }));
          setTimeout(() => this.resolvePaneContexts(i, i2));
        });
      });
    }
  }

  addContent(index: number) {
    this.bs.open(ContentSelectorComponent, { data: { panelForm: this.panels.controls[index], panelIndex: index, contexts: this.contexts } });
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

  applyStyle(index: number) {
    this.bs.open(StyleSelectorComponent, { data: this.panels.controls[index] });
  }

  onItemAdded() {
    console.log('item added');

    this.panels.push(this.fb.group({
      name: new FormControl(''),
      label: new FormControl(''),
      stylePlugin: new FormControl(''),
      settings: new FormArray([]),
      panes: this.fb.array([])
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
    })(this.panels.length - 1))
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
    const formArray = this.panelPane(index, index2).get('settings') as FormArray;
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
    const formArray = (this.panelPane(index, index2).get('settings') as FormArray);
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

  onPropertiesClick() {
    this.dialog
      .open(PropertiesDialogComponent, { data: { props: this.pageProperties } })
      .afterClosed()
      .subscribe((props: PropertiesFormPayload) => {
        if(props) {
          this.pageProperties = new PropertiesFormPayload({ ...props });
        }
      });
  }

  onRulesPane(index: number, index2: number) {
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

  }

  onDeletePane(index: number, index2: number) {
    console.log(`delete nested pane: ${index} | ${index2}`);
  }

  onAddContextClick() {
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
      this.dialog.open(ContextDialogComponent, { data: { context: editContext } })
      .afterClosed()
      .subscribe((context?: InlineContext) => {
        if(context) {
          this.contexts = this.contexts.map(c => c.name === name ? new InlineContext(context) : c);
        }
      });
    }
  }

  submit() {
    this.submitted.emit(this.packageFormData());
  }

  packageFormData(): PanelPage {
    //this.syncNestedPanelPages();
    let gridItems = [];
    switch(this.layoutType.value) {
      case 'grid':
        gridItems = this.gridLayout.grid.map((gi, i) => ({ ...gi, weight: i }));
        break;
      case 'split':
        gridItems = this.splitLayout.dashboard.map((gi, i) => ({ ...gi, cols: Math.floor(gi.cols), weight: i }));
        break;
      default:
    }
    const panelPage = new PanelPage({
      id: this.panelPageId,
      title: this.pageProperties.title,
      name: this.pageProperties.name,
      path: this.pageProperties.path,
      displayType: this.displayType.value,
      layoutType: this.layoutType.value,
      gridItems,
      contexts: this.contexts,
      panels: this.panels.value
    });
    console.log(panelPage);
    return panelPage;
  }

  syncNestedPanelPages() {
    console.log('sync nested');
    this.editablePanes.forEach(p => {
      if(p.contentEditor !== undefined) {
        const settings = this.panelHandler.buildSettings((p.contentEditor as ContentEditorComponent).packageFormData());
        const formArray = (this.panelPane(p.panelIndex, p.paneIndex).get('settings') as FormArray);
        formArray.clear();
        settings.forEach(s => formArray.push(this.convertToGroup(s)))
      }
    });
  }

  resolvePaneContexts(panelIndex: number, paneIndex: number) {
    const pane = new Pane(this.panelPane(panelIndex, paneIndex).value);
    const controls = this.panelPanes(panelIndex).controls;
    const plugin = this.contentPlugins.find(p => p.name === pane.contentPlugin);
    if(plugin.handler !== undefined && plugin.handler.isDynamic(pane.settings)) {
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
    }
  }

  panelPanes(index: number): FormArray {
    return this.panels.at(index).get('panes') as FormArray;
  }

  panelPane(index: number, index2: number): FormGroup {
    return this.panelPanes(index).at(index2) as FormGroup;
  }

  panelPanePlugin(index: number, index2: number): string {
    return this.panelPane(index, index2).get('contentPlugin').value;
  }

  panelPaneSettings(index: number, index2: number): Array<AttributeValue> {
    return this.panelPane(index, index2).get('settings').value.map(s => new AttributeValue(s));
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
    return this.stylePlugins.find(s => s.name === this.panels.at(index).get('stylePlugin').value).title;
  }

  onPaneEdit(index: number, index2: number) {
    const pane = new Pane(this.panelPane(index, index2).value);
    const plugin = this.panelPanePlugin(index, index2);
    const contentPlugin = this.contentPlugins.find(p => p.name === plugin);
    if(contentPlugin.editorComponent !== undefined) {
      const dialogRef = this.dialog.open(contentPlugin.editorComponent, { data: { panelFormGroup: this.panels.at(index), panelIndex: index, paneIndex: index2, contexts: this.contexts, contentAdded: this.contentAdded, pane } })
        .afterClosed()
        .subscribe(() => {
          this.resolvePaneContexts(index, index2);
        })
    }
  }

  onPaneDelete(index: number, index2: number) {
    this.panelPanes(index).removeAt(index2);
  }

  onFileChange(event: any, index: number) {
    const file: File = event.addedFiles[0];
    const plugin = this.contentPlugins.filter(p => p.handler !== undefined).find(p => p.handler.handlesType(file.type));
    if(plugin !== undefined) {
      plugin.handler.handleFile(file).subscribe(settings => {
        this.panelPanes(index).push(this.fb.group({
          contentPlugin: plugin.name,
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
    }
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

  convertToGroup(setting: AttributeValue): FormGroup {

    const fg = this.fb.group({
      name: new FormControl(setting.name, Validators.required),
      type: new FormControl(setting.type, Validators.required),
      displayName: new FormControl(setting.displayName, Validators.required),
      value: new FormControl(setting.value, Validators.required),
      computedValue: new FormControl(setting.value, Validators.required),
      attributes: new FormArray([])
    });

    if(setting.attributes && setting.attributes.length > 0) {
      setting.attributes.forEach(s => {
        (fg.get('attributes') as FormArray).push(this.convertToGroup(s));
      })
    }

    return fg;

  }

}
