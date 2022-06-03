import { Component, Input, Optional } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder } from '@angular/forms';
import { EntityCollectionService, EntityServices } from '@ngrx/data';
import { select } from '@ngrx/store';
import { FormlyFieldConfig  } from '@ngx-formly/core';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { ContentPluginManager } from '@rollthecloudinc/content';
import { InlineContext } from '@rollthecloudinc/context';
import { PageBuilderFacade, Pane, Panel, PanelPageState, PaneStateService, FormStateConverterService, PanelState, PanelPage, FormService, PanelPageForm, FormGroupConverterService, DatasourceContentHandler, PanelResolverService } from '@rollthecloudinc/panels';
import { BehaviorSubject, combineLatest, forkJoin, iif, Observable, of, Subject } from 'rxjs';
import { defaultIfEmpty, distinctUntilChanged, map, switchMap, take, tap } from 'rxjs/operators';
import { FormlyHandlerHelper } from '../../services/formly-handler-helper.service';
import { JSONPath } from "jsonpath-plus";
import { UrlGeneratorService } from '@rollthecloudinc/durl';
import { DatasourceApiService } from '@rollthecloudinc/datasource';
import { FormlyFieldInstance, FormlyRepeatingForm } from '../../models/formly.models';
import { Mapping, Param } from '@rollthecloudinc/dparam';
import { TokenizerService } from '@rollthecloudinc/token';
@Component({
  selector: 'classifieds-formly-repeating-renderer',
  styleUrls: ['./formly-repeating-renderer.component.scss'],
  templateUrl: './formly-repeating-renderer.component.html'
})
export class FormlyRepeatingRendererComponent {

  @Input()
  set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

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
  set resolvedContext(resolvedContext: any) {
    this.resolvedContext$.next(resolvedContext);
  }

  @Input()
  originMappings: Array<number> = [];

  readonly panes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly panel$ = new BehaviorSubject<Panel>(new Panel());
  readonly originPanes$ = new BehaviorSubject<Array<Pane>>([]);
  readonly ancestory$ = new BehaviorSubject<Array<number>>([]);
  readonly contexts$ = new BehaviorSubject<Array<InlineContext>>([]);
  readonly resolvedContext$ = new BehaviorSubject<any>(undefined);
  readonly settings$ = new BehaviorSubject<Array<AttributeValue>>([]);
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
    switchMap(([panes, originPanes]) => forkJoin(panes.filter(pane => pane.contentPlugin === 'formly_field' || pane.contentPlugin === 'panel').map(pane => this.cpm.getPlugin(pane.contentPlugin).pipe(map(plugin => ({ pane, plugin, panes, originPanes }))))).pipe(
      defaultIfEmpty([])
    )),
    switchMap(groups => forkJoin(groups.map(({ pane, plugin, panes, originPanes }) => plugin.handler.toObject(pane.settings).pipe(map(i => ({ pane, plugin, i, panes, originPanes }))))).pipe(
      defaultIfEmpty([])
    )),
    switchMap(groups => forkJoin(groups.map(({ pane, plugin, i, panes, originPanes }) => pane.contentPlugin === 'panel' ? of({ pane, plugin, i, panes, originPanes, f: { type: 'panelpage', panelpage: i } }) : this.formlyHandlerHelper.buildFieldConfig(i, new Map<string, any>([ [ 'panes', [ ...(panes && Array.isArray(panes) ? panes : []), ...(originPanes && Array.isArray(originPanes) ? originPanes : []) ] ], [ 'contexts', this.contexts ] ])).pipe(map(f => ({ pane, plugin, i, f, panes, originPanes })), take(1)))).pipe(
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
                panelAncestory: ancestory,
                indexPosition,
                templateOptions: {
                  ...f.templateOptions,
                  ...(i.type === 'autocomplete' ? { filter: this.makeFilterFunction({ i, metadata: new Map<string, any>([ [ 'panes', [ ...(panes && Array.isArray(panes) ? panes : []), ...(originPanes && Array.isArray(originPanes) ? originPanes : []) ] ], [ 'contexts', contexts ] ]) }) } : {}),
                }
              }]
            }))
          },
          hooks: {
            onInit: field => field.formControl.valueChanges.pipe(
              distinctUntilChanged(),
              tap(value => console.log(value)),
            ),
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
        const nestedPage = new PanelPage({ id: '', title: '', name: '', layoutType: '', displayType: '', gridItems: [], layoutSetting: undefined, rowSettings: undefined,  panels: [new Panel({ label: '', name: '', settings: undefined, stylePlugin: '', columnSetting: undefined, panes: panel.panes /*panes: panel.panes.filter(pane => pane.contentPlugin === 'formly_field')*/ })] });
        /*const rebuiltPanel = new Panel({ ...panel, panes: panelState ? panelState.panes.map(() => new Pane({ name: panel.name, label: panel.label, contentPlugin: 'panel', nestedPage: new PanelPage(nestedPage), settings: this.attributeSerializer.serialize(nestedPage, 'root').attributes })) : [] });

        this.formStateConverter.convertPanelToForm({ panel: panelState ? panelState : new PanelState(), panel2: rebuiltPanel, ancestory }).subscribe(panelForm => {
          const paneControlArray = this.controlContainer.control.get('panes') as FormArray;
          this.formGroupConverter.makeFormGroupFromPanel(rebuiltPanel, panelForm).subscribe(panelFormGroup => {
            paneControlArray.clear();
            const paneControls = panelFormGroup.get('panes') as FormArray;
            const len = paneControls.length;
            for (let i = 0; i < len ; i++) {
              paneControlArray.push(paneControls.at(i));
            }
          });
        });*/

        // In progress logic to support nested panel pages inside formly repeating panel.
        this.rebuildPanel({ panel, panelState }).subscribe(rebuiltPanel => {
          console.log('rebuilt panel', rebuiltPanel);

          this.formStateConverter.convertPanelToForm({ panel: panelState ? panelState : new PanelState(), panel2: rebuiltPanel, ancestory }).subscribe(panelForm => {
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

        });
      })
    ))
  ).subscribe();

  private readonly populateDefaultValues = combineLatest([
    this.settings$.pipe(
      map(s => s ? new FormlyRepeatingForm(this.attributeSerializer.deserializeAsObject(s)) : undefined)
    ),
    this.resolvedContext$,
    this.panel$
  ]).pipe(
    map(([ s, rc, p ]) => ({ s, rc, p })),
    map(({ s, rc, p }) => {
      if (rc && s && s.valuesMapping && s.valuesMapping.trim() !== '') {
        const items = JSONPath({ path: `$.${s.valuesMapping}.*`, json: rc });
        return { items, s, p }
      } else {
        return { items: [], p };
      }
    }),
    tap(({ items, p }) => {
      /**
       * This approach is completely different from a normal field using tokens.
       * However, it seems to work well and at the moment I can't think of a problem with it. It
       * does limit the flexibility a bit in terms of mapping values to unconvential structures.
       */
      const len = items.length;
      const itemsModel = [];
      const itemsKey = p.name && p.name !== '' ? p.name : 'items';
      for (let i = 0; i < len; i++) {
        const itemModel = {};
        const itemKeys = Object.keys(items[i]);
        itemKeys.forEach(k => itemModel[k] = { value: items[i][k] });
        itemsModel.push(itemModel);
      }
      this.model = { [itemsKey]: itemsModel };
    })
  ).subscribe()

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
    private tokenizerService: TokenizerService,
    es: EntityServices,
    @Optional() public controlContainer?: ControlContainer
  ) {
    this.panelPageStateService = es.getEntityCollectionService('PanelPageState');
  }

  ngOnInit() {
    this.init$.next(undefined);
  }

  makeFilterFunction({ i, metadata }: { i: FormlyFieldInstance, metadata: Map<string, any> }): ({ term: string, field: FormlyFieldConfig }) => Observable<Array<any>> {
    //const metadata = new Map<string, any>([ [ 'panes', this.panes ], [ 'contexts', this.contexts ] ]);
    const dataPane = (metadata.get('panes') as Array<Pane>).find(p => p.name === i.datasourceBinding.id);
    return ({ term, field }: { term: string, field: FormlyFieldConfig }) => of([]).pipe(
      switchMap(() => iif(
        () => !!i.datasourceBinding,
        i.datasourceBinding ? this.panelResolver.dataPanes(metadata.get('panes') as Array<Pane>).pipe(
          switchMap(dataPanes => dataPane ? this.datasourceHandler.fetchDynamicData(dataPane.settings, new Map<string, any>([ ...metadata, [ 'dataPanes', dataPanes ], [ 'inputparams', new Map<string, Param>([ [ 'term', new Param({ flags: [], mapping: new Mapping({ value: term, testValue: term, type: 'static', context: undefined, }) }) ] ]) ] ])) : of([])),
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

  rebuildPanel({ panel, panelState }: { panel: Panel, panelState: PanelState }): Observable<Panel> {
    return forkJoin(panelState ? panelState.panes.map((pane, index) => panel.panes[index].contentPlugin === 'panel' ? this.rebuildFromPanelPage({ panelPage: new PanelPage(this.attributeSerializer.deserializeAsObject(panel.panes[index].settings)), pane: panel.panes[index], panelPageState: panelState && panelState.panes[index] ? panelState.panes[index].nestedPage : undefined }) : of(panel.panes[index]) ): []).pipe(
      map(panes => new PanelPage({ id: '', title: '', name: '', layoutType: '', displayType: '', gridItems: [], layoutSetting: undefined, rowSettings: undefined,  panels: [new Panel({ label: panel.label, name: panel.name, settings: undefined, stylePlugin: panel.stylePlugin, columnSetting: undefined, panes })] })),
      map(nestedPage => new Panel({ ...panel, panes: panelState ? panelState.panes.map(() => new Pane({ name: panel.name, label: panel.label, contentPlugin: 'panel', nestedPage, settings: this.attributeSerializer.serialize(nestedPage, 'root').attributes })) : [] })),
      defaultIfEmpty(new Panel(panel))
    )
  }

  rebuildFromPanelPage({ panelPageState, panelPage, pane }: { panelPageState: PanelPageState, panelPage: PanelPage, pane: Pane }): Observable<Pane> {
    return forkJoin(
      panelPage.panels.map(((panel, index) => panel.stylePlugin === 'formly_repeating' ? this.rebuildPanel({ panel, panelState: panelPageState ? panelPageState.panels[index] : undefined }) : of(panel))),
    ).pipe(
      map(panels => new Pane({ ...pane, nestedPage: new PanelPage({ ...panelPage, panels: panels.map(p => new Panel(p)) }) })),
      defaultIfEmpty(new Pane({ ...pane, nestedPage: new PanelPage(panelPage) }))
    );
  }

}