import { Inject, Injectable } from '@angular/core';
import { AttributeValue, AttributeSerializerService } from '@ng-druid/attributes';
import { ContentHandler, ContentBinding, ContentPluginEditorOptions } from '@ng-druid/content';
import { Rest, Dataset, DatasourcePluginManager, Datasource, DatasourcePlugin, DatasourceEvaluator } from '@ng-druid/datasource';
import { InlineContext } from '@ng-druid/context';
import { SITE_NAME } from '@ng-druid/utils';
import { Observable, of, iif, forkJoin, from } from 'rxjs';
import * as uuid from 'uuid';
import { map, filter, switchMap, take, defaultIfEmpty, mergeAll } from 'rxjs/operators';
import { Panel, PanelPage, Pane, LayoutSetting } from '../models/panels.models';
import { PanelContentHandler } from './panel-content.handler';
import { RulesResolverService } from '@ng-druid/rules';
@Injectable({
  providedIn: 'root'
})
export class DatasourceContentHandler implements ContentHandler {

  constructor(
    @Inject(SITE_NAME) private siteName: string,
    private panelHandler: PanelContentHandler,
    private attributeSerializer: AttributeSerializerService,
    private rulesResolver: RulesResolverService,
    private dpm: DatasourcePluginManager,
    private datasourceEvalutator: DatasourceEvaluator
  ) { }

  handleFile(file: File): Observable<Array<AttributeValue>> {
    return of([]);
  }
  handlesType(type: string): boolean {
    return false;
  }
  implementsRendererOverride(): boolean {
    return true;
  }
  hasRendererOverride(settings: Array<AttributeValue>): Observable<boolean> {
    return of(false);
  }
  isDynamic(settings: Array<AttributeValue>): boolean {
    return true;
  }
  isData(settings: Array<AttributeValue>): boolean {
    return true;
  }
  fetchDynamicData(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<any> {
    const dataPanes = metadata.has('dataPanes') ? new Map<string, Pane>((metadata.get('dataPanes') as Array<Pane>).map(p => [p.name, p])) : new Map<string, any>([]);
    const datasources = new Map<string, Datasource>((Array.from(dataPanes).map(([k, v]) => [ k, new Datasource(this.attributeSerializer.deserializeAsObject(v.settings)) ])));
    return this.toObject(settings).pipe(
      switchMap(ds => this.datasourceEvalutator.evalDatasource({ datasource: ds, metadata, datasources }))
    );
    /*return this.toObject(settings).pipe(
      switchMap(ds => this.dpm.getPlugin(ds.plugin).pipe(
        map<DatasourcePlugin<string>, [Datasource, DatasourcePlugin<string>]>(p => [ds, p])
      )),
      switchMap(([ds, p]) => p.fetch({ settings: ds.settings, metadata, datasource: ds }).pipe(
        map<Dataset, [Datasource, Dataset]>(d => [ds, d])
      )),
      switchMap(([ds, dataset]) => 
        forkJoin(
          ds.renderer.bindings.reduce<Array<Observable<Datasource>>>((p, c) => [ ...p, ...(dataPanes.has(c.id) ? [ this.toObject(dataPanes.get(c.id).settings) ] : []) ], [])
        ).pipe(
          switchMap(datasources => datasources.reduce<Observable<Dataset>>((p, c) => p.pipe(
            switchMap<Dataset, Observable<[DatasourcePlugin<string>, Dataset, Datasource]>>(dataset2 => this.dpm.getPlugin(c.plugin).pipe(
              map(dsp => [dsp, dataset2, c])
            )),
            switchMap(([dsp, dataset2, nestedDatasource]) => dsp.fetch({ settings: c.settings, dataset: dataset2, metadata, datasource: nestedDatasource }))
          ), of(dataset))),
          map(dataset => dataset),
          defaultIfEmpty(dataset)
        )
      )
    );*/
  }
  buildDynamicItems(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<Array<AttributeValue>> {
    const dataPanes = new Map<string, Pane>((metadata.get('dataPanes') as Array<Pane>).map(p => [p.name, p]));
    return this.fetchDynamicData(settings, metadata).pipe(
      switchMap(dataset => this.toObject(settings).pipe(
        map(ds => [ds, dataset])
      )),
      switchMap<[Datasource, Dataset], Observable<[Datasource, Dataset, Array<ContentBinding>]>>(([ds, dataset]) => this.getBindings(settings, 'pane').pipe(
        map<Array<ContentBinding>, [Datasource, Dataset, Array<ContentBinding>]>(bindings => [ds, dataset, bindings])
      )),
      switchMap(([ds, dataset, bindings]) => iif(
        () => dataset.results.length !== 0 && bindings.length > 0,
        forkJoin(
          dataset.results.map(
            row => forkJoin(
              bindings.filter(b => !dataPanes.has(b.id)).map(binding => of((metadata.get('panes') as Array<Pane>).find(p => p.name === binding.id)).pipe(
                switchMap(pane => iif(
                  () => pane && pane.rule && pane.rule !== null && pane.rule.condition !== '',
                  pane ? this.rulesResolver.evaluate(pane.rule,[ ...(metadata.get('contexts') as Array<InlineContext>), ...(pane.contexts !== undefined ? pane.contexts : []), new InlineContext({ name: "_root", adaptor: 'data', data: row }) ]).pipe(
                    map<boolean, [Pane, boolean]>(res => [pane, res])
                  ) : of<[Pane, boolean]>([pane, false]),
                  of(false).pipe(
                    map<boolean, [Pane, boolean]>(b => [pane, b])
                  )
                )),
                filter(([_, res]) => res),
                map(([pane, _]) => pane.name),
                defaultIfEmpty(binding.id)
              ))
            ).pipe(
              map(groups => groups.reduce<Array<string>>((p, c) => [ ...p, c ], []))
            )
          )
        ).pipe(
          map<Array<Array<string>>, [Datasource, Dataset, Array<Array<string>>]>(groups => [ds, dataset, groups ])
        ),
        new Observable<[Datasource, Dataset, Array<Array<string>>]>(obs => {
          obs.next([ds, dataset, []]);
          obs.complete();
        })
      )),
      map(([_, dataset, paneMappings]) => dataset.results.reduce((p, row, rowIndex) => [ ...p, ...(paneMappings[rowIndex] ? paneMappings[rowIndex].map(bId => new Pane({ ...(metadata.get('panes') as Array<Pane>).find(p => p.name === bId), rule: undefined, label: uuid.v4(), contexts: [ ...(metadata.get('contexts') as Array<InlineContext>) ,new InlineContext({ name: "_root", adaptor: 'data', data: row })] })) : []) ], [])),
      map(panes => new Panel({ stylePlugin: undefined, settings: [], panes, columnSetting: new LayoutSetting() })),
      map(panel => this.panelHandler.buildSettings(new PanelPage({ id: undefined, layoutType: 'grid', displayType: 'page', site: this.siteName, gridItems: [], layoutSetting: new LayoutSetting(), rowSettings: [], panels: [ panel ] }))),
      map(panelSettings => panelSettings.find(s => s.name === 'panels').attributes[0].attributes.find(s => s.name === 'panes').attributes)
    );
  }
  getBindings(settings: Array<AttributeValue>, type: string, metadata?: Map<string, any>): Observable<Array<ContentBinding>> {
    const dataPanes = metadata ? new Map<string, Pane>((metadata.get('dataPanes') as Array<Pane>).map(p => [p.name, p])) : new Map<string, any>();
    if(type === 'context') {
      return this.toObject(settings).pipe(
        map(ds => [ds, ds.params ? ds.params.reduce((p, c) => ([ ...p, ...(c.mapping.type === 'form' ? [ new ContentBinding({ id: `form__${c.mapping.value.split('.', 2)[0].trim()}`, type: 'context' }) ] : []) ]), []): [] ]),
        switchMap<[Datasource, Array<ContentBinding>], Observable<[Datasource, Array<ContentBinding>]>>(([ds, bindings]) => this.dpm.getPlugin(ds.plugin).pipe(
          switchMap<DatasourcePlugin<string>, Observable<[Datasource, Array<ContentBinding>]>>(dsp => dsp.getBindings({ settings: ds.settings, metadata }).pipe(
            map(bindings => [ds, bindings])
          ))
        )),
        switchMap<[Datasource, Array<ContentBinding>], Observable<Array<ContentBinding>>>(([ds, bindings]) => 
          forkJoin(
            ds.renderer.bindings.reduce<Array<Observable<Datasource>>>((p, c) => [ ...p, ...(dataPanes.has(c.id) ? [ this.toObject(dataPanes.get(c.id).settings) ] : []) ], [])
          ).pipe(
            switchMap(datasources => forkJoin(
              datasources.map(d => this.dpm.getPlugin(d.plugin).pipe(
                switchMap<DatasourcePlugin<string>, Observable<Array<ContentBinding>>>(dsp => dsp.getBindings({ settings: d.settings, metadata }))
              ))
            ).pipe(
              map(dsBindings => dsBindings.reduce((p, c) => [ ...p, ...c ], bindings)),
              defaultIfEmpty(bindings)
            )),
            defaultIfEmpty(bindings)
          )
        )
      );
    } else {
      return this.toObject(settings).pipe(
        switchMap(ds => iif(
          () => ds.renderer.type === type,
          of(ds.renderer.bindings),
          of([])
        ))
      );
    }
  }
  toObject(settings: Array<AttributeValue>): Observable<Datasource> {
    return of(this.attributeSerializer.deserializeAsObject(settings));
  }
  buildSettings(rest: Rest): Array<AttributeValue> {
    return this.attributeSerializer.serialize(rest, 'root').attributes;
  }
  getRenderType(settings: Array<AttributeValue>) : string {
    const renderType = [settings.find(s => s.name === 'renderer')].map(r => r.attributes.find(s => s.name === 'type'));
    return renderType.length > 0 ? renderType[0].value: undefined;
  }
  stateDefinition(settings: Array<AttributeValue>): Observable<any> {
    // What about this?
    return of({ autocomplete: { input: '' }, loading: 'y' });
  }
  editorOptions(settings: Array<AttributeValue>): Observable<ContentPluginEditorOptions> {
    return this.toObject(settings).pipe(
      switchMap(ds => this.dpm.getPlugin(ds && ds.plugin ? ds.plugin : 'data').pipe(
        map<DatasourcePlugin<string>, [Datasource, DatasourcePlugin<string>]>(p => [ds, p])
      )),
      switchMap(([ds, p]) => p.editorOptions ? p.editorOptions({ settings: ds && ds.settings ? ds.settings: [] }) : of(undefined)),
      map(o => new ContentPluginEditorOptions({ fullscreen: o ? o.fullscreen : false }))
    );
  }
}