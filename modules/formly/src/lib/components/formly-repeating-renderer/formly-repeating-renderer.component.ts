import { Component, Input, Optional } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder } from '@angular/forms';
import { EntityCollectionService, EntityServices } from '@ngrx/data';
import { select } from '@ngrx/store';
import { FormlyFieldConfig  } from '@ngx-formly/core';
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { ContentPluginManager } from 'content';
import { InlineContext } from 'context';
import { PageBuilderFacade, Pane, Panel, PanelPageState, PaneStateService, FormStateConverterService, PanelState, PanelPage, FormService, PanelPageForm, FormGroupConverterService, DatasourceContentHandler, PanelResolverService } from 'panels';
import { BehaviorSubject, combineLatest, forkJoin, iif, Observable, of, Subject } from 'rxjs';
import { defaultIfEmpty, map, switchMap, take, tap } from 'rxjs/operators';
import { FormlyHandlerHelper } from '../../services/formly-handler-helper.service';
import { JSONPath } from "jsonpath-plus";
import { UrlGeneratorService } from 'durl';
import { DatasourceApiService } from 'datasource';
import { FormlyFieldInstance } from '../../models/formly.models';

@Component({
  selector: 'classifieds-formly-repeating-renderer',
  styleUrls: ['./formly-repeating-renderer.component.scss'],
  templateUrl: './formly-repeating-renderer.component.html'
})
export class FormlyRepeatingRendererComponent {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  set panes(panes: Array<Pane>) {
    this.panes$.next(panes);
  }

  @Input()
  set panel(panel: Panel) {
    this.panel$.next(panel);
  }

  @Input()
  set originPanes(originPanes: Array<Pane>) {
    this.originPanes$.next(originPanes);
  }

  @Input()
  set ancestory(ancestory: Array<number>) {
    this.ancestory$.next(ancestory);
  }

  @Input()
  set contexts(contexts: Array<InlineContext>) {
    this.contexts$.next(contexts);
  }

  @Input()
  originMappings: Array<number> = [];

  @Input()
  resolvedContext = {};

  readonly panes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly panel$ = new BehaviorSubject<Panel>(new Panel());
  readonly originPanes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly ancestory$ = new BehaviorSubject<Array<number>>([]);
  readonly contexts$ = new BehaviorSubject<Array<InlineContext>>([]);
  readonly init$ = new Subject();
  fields: FormlyFieldConfig[] = [];
  model: any = {
    items: []
  };
  readonly proxyGroup = this.fb.group({});
  private panelPageStateService: EntityCollectionService<PanelPageState>;

  private readonly panesSub = combineLatest([
    this.panes$,
    this.originPanes$
  ]).pipe(
    switchMap(([panes, originPanes]) => forkJoin(panes.filter(pane => pane.contentPlugin === 'formly_field').map(pane => this.cpm.getPlugin(pane.contentPlugin).pipe(map(plugin => ({ pane, plugin, panes, originPanes }))))).pipe(
      defaultIfEmpty([])
    )),
    switchMap(groups => forkJoin(groups.map(({ pane, plugin, panes, originPanes }) => plugin.handler.toObject(pane.settings).pipe(map(i => ({ pane, plugin, i, panes, originPanes }))))).pipe(
      defaultIfEmpty([])
    )),
    switchMap(groups => forkJoin(groups.map(({ pane, plugin, i, panes, originPanes }) => this.formlyHandlerHelper.buildFieldConfig(i, new Map<string, any>([ [ 'panes', [ ...(panes && Array.isArray(panes) ? panes : []), ...(originPanes && Array.isArray(originPanes) ? originPanes : []) ] ], [ 'contexts', this.contexts ] ])).pipe(map(f => ({ pane, plugin, i, f, panes, originPanes })), take(1)))).pipe(
      defaultIfEmpty([]),
      take(1)
    )),
    switchMap(groups => combineLatest([
      this.panel$,
      this.ancestory$,
      this.contexts$
    ]).pipe(
      map(([panel, ancestory, contexts]) => ({ groups, panel, ancestory, contexts }))
    )),
    tap(({ groups, panel, ancestory, contexts }) => {
      this.fields = [
        {
          key: panel.name && panel.name !== '' ? panel.name : 'items',
          type: 'repeat',
          templateOptions: {
            addText: 'Add another',
          },
          fieldArray: {
            fieldGroup: groups.map(({ f, i, pane, panes, originPanes }, indexPosition) => ({
              key: i.key && i.key  !== '' ? i.key : pane.name && pane.name !== '' ? pane.name : f.key,
              wrappers: [ ...(f.wrappers ? f.wrappers : []), 'imaginary-pane' ],
              pane: pane,
              panelAncestory: ancestory,
              indexPosition,
              fieldGroup: [{
                ...f,
                templateOptions: {
                  ...f.templateOptions,
                  ...(i.type === 'autocomplete' ? { filter: this.makeFilterFunction({ i, metadata: new Map<string, any>([ [ 'panes', [ ...(panes && Array.isArray(panes) ? panes : []), ...(originPanes && Array.isArray(originPanes) ? originPanes : []) ] ], [ 'contexts', contexts ] ]) }) } : {}),
                }
              }]
            }))
          }
        }
      ];
    })
  ).subscribe();

  private readonly forwardStateToForm = combineLatest([
    this.pageBuilderFacade.getPageInfo$,
    this.panel$,
    this.ancestory$,
    this.init$
  ]).pipe(
    map(([p, panel, ancestory]) => ({ p, panel, ancestory })),
    switchMap(({ p, panel, ancestory }) => this.panelPageStateService.collection$.pipe(
      select(this.paneStateService.selectById({ id: p.id })),
      map(ps => new PanelPageState(ps ? ps : { id: p.id, panels: [] })),
      tap(s => {
        const path= '$.' + ancestory.map((index, i) => `${(i + 1) % 2 === 0 ? 'panes' : (i === 0 ? '' : 'nestedPage.') + 'panels'}[${index}]`).join('.');
        const panelState = JSONPath({ path, json: s })[0];
        const nestedPage = new PanelPage({ id: '', title: '', name: '', layoutType: '', displayType: '', gridItems: [], layoutSetting: undefined, rowSettings: undefined,  panels: [new Panel({ label: '', name: '', settings: undefined, stylePlugin: '', columnSetting: undefined, panes: panel.panes.filter(pane => pane.contentPlugin === 'formly_field') })] });
        const rebuiltPanel = new Panel({ ...panel, panes: panelState ? panelState.panes.map(() => new Pane({ name: panel.name, label: panel.label, contentPlugin: 'panel', nestedPage: new PanelPage(nestedPage), settings: this.attributeSerializer.serialize(nestedPage, 'root').attributes })) : [] });
        this.formStateConverter.convertPanelToForm(panelState ? panelState : new PanelState(), rebuiltPanel).subscribe(panelForm => {
          const paneControlArray = this.controlContainer.control.get('panes') as FormArray;
          this.formGroupConverter.makeFormGroupFromPanel(rebuiltPanel, panelForm).subscribe(panelFormGroup => {
            paneControlArray.clear();
            const paneControls = panelFormGroup.get('panes') as FormArray;
            const len = paneControls.length;
            for (let i = 0; i < len ; i++) {
              paneControlArray.push(paneControls.at(i));
            }
          });
        });
      })
    ))
  ).subscribe();

  constructor(
    private fb: FormBuilder,
    private cpm: ContentPluginManager,
    private formlyHandlerHelper: FormlyHandlerHelper,
    private paneStateService: PaneStateService,
    private pageBuilderFacade: PageBuilderFacade,
    private formStateConverter: FormStateConverterService,
    private attributeSerializer: AttributeSerializerService,
    private formService: FormService,
    private formGroupConverter: FormGroupConverterService,
    private urlGeneratorService: UrlGeneratorService ,
    private datasourceApi: DatasourceApiService,
    private datasourceHandler: DatasourceContentHandler,
    private panelResolver: PanelResolverService,
    es: EntityServices,
    @Optional() public controlContainer?: ControlContainer
  ) {
    this.panelPageStateService = es.getEntityCollectionService('PanelPageState');
  }

  ngOnInit() {
    this.init$.next();
  }

  makeFilterFunction({ i, metadata }: { i: FormlyFieldInstance, metadata: Map<string, any> }): (term: string) => Observable<Array<any>> {
    //const metadata = new Map<string, any>([ [ 'panes', this.panes ], [ 'contexts', this.contexts ] ]);
    const dataPane = (metadata.get('panes') as Array<Pane>).find(p => p.name === i.datasourceBinding.id);
    return (term: string) => of([]).pipe(
      switchMap(() => iif(
        () => !!i.datasourceBinding,
        i.datasourceBinding ? this.panelResolver.dataPanes(metadata.get('panes') as Array<Pane>).pipe(
          switchMap(dataPanes => dataPane ? this.datasourceHandler.fetchDynamicData(dataPane.settings, new Map<string, any>([ ...metadata, [ 'dataPanes', dataPanes ] ])) : of([])),
          map(d => d.results)
        ): of([]),
        !i.datasourceBinding ? this.urlGeneratorService.getUrl(i.rest.url, i.rest.params, metadata).pipe(
          switchMap(s => this.datasourceApi.getData(`${s}`))
        ) : of([])
      )),
      map((d => i.datasourceOptions && i.datasourceOptions.query !== '' ? JSONPath({ path: i.datasourceOptions.query, json: d }) : d)),
      switchMap(data => this.formlyHandlerHelper.mapDataOptions(i, data))
    );
  }

}