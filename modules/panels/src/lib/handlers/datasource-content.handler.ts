import { Inject, Injectable } from '@angular/core';
// import { Store, select } from '@ngrx/store';
import { AttributeValue, AttributeSerializerService } from 'attributes';
import { ContentHandler, ContentBinding } from 'content';
// import { Snippet } from 'snippet';
import { Rest, Dataset, DatasourcePluginManager, Datasource, DatasourcePlugin, SelectMapping, SelectOption } from 'datasource';
import { InlineContext } from 'context';
import { SITE_NAME } from 'utils';

// move to snippet module?
// import { SnippetContentHandler } from './snippet-content.handler';


import { Observable, of, iif, forkJoin, from } from 'rxjs';
import * as uuid from 'uuid';
import { map, filter, switchMap, take, defaultIfEmpty, tap, reduce } from 'rxjs/operators';



// import { PageBuilderFacade } from '../features/page-builder/page-builder.facade';
// import { selectDataset } from '../features/page-builder/page-builder.selectors';
// import { PageBuilderPartialState } from '../features/page-builder/page-builder.reducer';


import { TokenizerService } from 'token';
import { UrlGeneratorService } from 'durl';

import { Panel, PanelPage, Pane, LayoutSetting } from '../models/panels.models';
import { PanelContentHandler } from './panel-content.handler';


// move to rules module.
import { RulesResolverService } from 'rules';

@Injectable({
  providedIn: 'root'
})
export class DatasourceContentHandler implements ContentHandler {

  constructor(
    @Inject(SITE_NAME) private siteName: string,
    // private snippetHandler: SnippetContentHandler,
    // private pageBuilderFacade: PageBuilderFacade,
    // private store: Store<PageBuilderPartialState>,
    private tokenizerService: TokenizerService,
    private panelHandler: PanelContentHandler,
    private attributeSerializer: AttributeSerializerService,
    private rulesResolver: RulesResolverService,
    private dpm: DatasourcePluginManager
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
    // return ['snippet','pane'].indexOf(this.getRenderType(settings)) > -1;
    return true;
  }
  isData(settings: Array<AttributeValue>): boolean {
    return true;
  }
  fetchDynamicData(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<any> {
    /*const subject = new Subject<Dataset>();
    this.toObject(settings).pipe(
      switchMap(r => this.urlGeneratorService.getUrl(r.url, r.params, metadata).pipe(
        map<string, [Rest, string]>(url => [r, url])
      ))
    ).subscribe(([r, url]) => {
      this.pageBuilderFacade.loadRestData(`${metadata.get('tag')}`, new Rest({ ...r, url }));
      this.store.pipe(
        select(selectDataset(`${metadata.get('tag')}`)),
        filter(dataset => dataset !== undefined),
      ).subscribe(dataset => {
        subject.next(dataset);
        subject.complete();
      });
    });*/

    /*this.toObject(settings).pipe(
      switchMap(dss => this.dpm.getPlugin(dss.source.plugin).pipe(
        map(p => [dss, p])
      )),
      switchMap(([dss, p]) => p.fetch(dss.ettings)),
      map(d => (d as any).results)
    );*/

    return of([]);

  }
  buildDynamicItems(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<Array<AttributeValue>> {
    const dataPanes = new Map<string, Pane>((metadata.get('dataPanes') as Array<Pane>).map(p => [p.name, p]));
    return this.toObject(settings).pipe(
      switchMap(ds => this.dpm.getPlugin(ds.plugin).pipe(
        map<DatasourcePlugin<string>, [Datasource, DatasourcePlugin<string>]>(p => [ds, p])
      )),
      switchMap(([ds, p]) => p.fetch({ settings: ds.settings }).pipe(
        map<Dataset, [Datasource, Dataset]>(d => [ds, d])
      )),
      switchMap(([ds, dataset]) => 
        forkJoin(
          ds.renderer.bindings.reduce<Array<Observable<Datasource>>>((p, c) => [ ...p, ...(dataPanes.has(c.id) ? [ this.toObject(dataPanes.get(c.id).settings) ] : []) ], [])
        ).pipe(
          switchMap(datasources => datasources.reduce<Observable<Dataset>>((p, c) => p.pipe(
            switchMap<Dataset, Observable<[DatasourcePlugin<string>, Dataset]>>(dataset2 => this.dpm.getPlugin(c.plugin).pipe(
              map(dsp => [dsp, dataset2])
            )),
            switchMap(([dsp, dataset2]) => dsp.fetch({ settings: c.settings, dataset: dataset2 }))
          ), of(dataset))),
          map(dataset => [ds, dataset]),
          defaultIfEmpty([ds, dataset])
        )
      ),
      switchMap<[Datasource, Dataset], Observable<[Datasource, Dataset, Array<ContentBinding>]>>(([ds, dataset]) => this.getBindings(settings, 'pane').pipe(
        map<Array<ContentBinding>, [Datasource, Dataset, Array<ContentBinding>]>(bindings => [ds, dataset, bindings])
      )),
      switchMap(([ds, dataset, bindings]) => iif(
        () => dataset.results.length !== 0 && bindings.length > 0,
        /*new Observable<[Datasource, Dataset, Array<string>]>(obs => {
          forkJoin(
            dataset.results.map(row => from(bindings).pipe(
              map(binding => (metadata.get('panes') as Array<Pane>).find(p => p.name === binding.id)),
              switchMap(pane => iif(
                () => pane.rule && pane.rule !== null && pane.rule.condition !== '',
                this.rulesResolver.evaluate(pane.rule,[ ...(metadata.get('contexts') as Array<InlineContext>), ...(pane.contexts !== undefined ? pane.contexts : []), new InlineContext({ name: "_root", adaptor: 'data', data: row }) ]).pipe(
                  map<boolean, [Pane, boolean]>(res => [pane, res])
                ),
                of(false).pipe(
                  map<boolean, [Pane, boolean]>(b => [pane, b])
                )
              )),
              filter(([_, res]) => res),
              map(([pane, _]) => pane.name),
              defaultIfEmpty(bindings[0].id),
              take(1)
            ))
          ).pipe(
            map<Array<string>, [Dataset, Array<string>]>(groups => [dataset, groups]),
            take(1)
          )
          ).subscribe(d => {
            obs.next([ds, ...d]);
            obs.complete();
          });
        }),*/
        forkJoin(
          dataset.results.map(row => from(bindings).pipe(
            map(binding => (metadata.get('panes') as Array<Pane>).find(p => p.name === binding.id)),
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
            defaultIfEmpty(bindings[0].id),
            take(1)
          ))
        ).pipe(
          map<Array<string>, [Datasource, Dataset, Array<string>]>(groups => [ds, dataset, groups])
          // take(1)
        ),
        new Observable<[Datasource, Dataset, Array<string>]>(obs => {
          obs.next([ds, dataset, []]);
          obs.complete();
        })
      )),
      map(([ds, dataset, paneMappings]) => {
        if(ds.renderer.type === 'pane') {
          return dataset.results.map((row, rowIndex) => {
            const attachedPane = (metadata.get('panes') as Array<Pane>).find(p => p.name === paneMappings[rowIndex]);
            const name = uuid.v4();
            return new Pane({ ...attachedPane, rule: undefined, label: name, contexts: [ ...(metadata.get('contexts') as Array<InlineContext>) ,new InlineContext({ name: "_root", adaptor: 'data', data: row })] });
          }) as Array<Pane>;
        } else {
          return dataset.results.map(row => new Pane({ contentPlugin: 'snippet', name: uuid.v4(), label: undefined, contexts: [ ...(metadata.get('contexts') as Array<InlineContext>), new InlineContext({ name: "_root", adaptor: 'data', data: row })], settings: this.attributeSerializer.serialize({ ...ds.renderer.data, content: ds.renderer.data.content }, 'root').attributes })) as Array<Pane>;
        }
      }),
      map(panes => new Panel({ stylePlugin: undefined, settings: [], panes, columnSetting: new LayoutSetting() })),
      map(panel => this.panelHandler.buildSettings(new PanelPage({ id: undefined, layoutType: 'grid', displayType: 'page', site: this.siteName, gridItems: [], layoutSetting: new LayoutSetting(), rowSettings: [], panels: [ panel ] }))),
      map(panelSettings => panelSettings.find(s => s.name === 'panels').attributes[0].attributes.find(s => s.name === 'panes').attributes)
    );

    /*this.toObject(settings).pipe(
      switchMap(r => this.urlGeneratorService.getUrl(r.url, r.params, metadata).pipe(
        map<string, [Rest, string]>(url => [r, url])
      ))
    ).subscribe(([r, url]) => {
      console.log('Load in rest data');
      this.pageBuilderFacade.loadRestData(`${metadata.get('tag')}`, new Rest({ ...r, url }));
      this.store.pipe(
        select(selectDataset(`${metadata.get('tag')}`)),
        filter(dataset => dataset !== undefined),
        // apply query here to dataset.
        switchMap(dataset => this.getBindings(settings, 'pane').pipe(
          map<Array<ContentBinding>, [Dataset, Array<ContentBinding>]>(bindings => [dataset, bindings])
        )),
        switchMap(([dataset, bindings]) => iif(
          () => dataset.results.length !== 0 && bindings.length > 0,
          new Observable<[Dataset, Array<string>]>(obs => {
            forkJoin(
              dataset.results.map(row => from(bindings).pipe(
                map(binding => (metadata.get('panes') as Array<Pane>).find(p => p.name === binding.id)),
                switchMap(pane => iif(
                  () => pane.rule && pane.rule !== null && pane.rule.condition !== '',
                  this.rulesResolver.evaluate(pane.rule,[ ...(metadata.get('contexts') as Array<InlineContext>), ...(pane.contexts !== undefined ? pane.contexts : []), new InlineContext({ name: "_root", adaptor: 'data', data: row }) ]).pipe(
                    map<boolean, [Pane, boolean]>(res => [pane, res])
                  ),
                  of(false).pipe(
                    map<boolean, [Pane, boolean]>(b => [pane, b])
                  )
                )),
                filter(([pane, res]) => res),
                map(([pane, res]) => pane.name),
                defaultIfEmpty(bindings[0].id),
                take(1)
              ))
            ).pipe(
              map<Array<string>, [Dataset, Array<string>]>(groups => [dataset, groups])
            ).subscribe(d => {
              obs.next(d);
              obs.complete();
            });
          }),
          new Observable<[Dataset]>(obs => {
            obs.next([dataset]);
            obs.complete();
          })
        )),
        map(([dataset, paneMappings]) => {
          if(r.renderer.type === 'pane') {
            return dataset.results.map((row, rowIndex) => {
              const attachedPane = (metadata.get('panes') as Array<Pane>).find(p => p.name === paneMappings[rowIndex]);
              const name = uuid.v4();
              return new Pane({ ...attachedPane, rule: undefined, label: name, contexts: [ ...(metadata.get('contexts') as Array<InlineContext>) ,new InlineContext({ name: "_root", adaptor: 'data', data: row })] });
            }) as Array<Pane>;
          } else {
            return dataset.results.map(row => new Pane({ contentPlugin: 'snippet', name: uuid.v4(), label: undefined, contexts: [ ...(metadata.get('contexts') as Array<InlineContext>), new InlineContext({ name: "_root", adaptor: 'data', data: row })], settings: this.snippetHandler.buildSettings({ ...r.renderer.data, content: r.renderer.data.content }) })) as Array<Pane>;
          }
        }),
        map(panes => new Panel({ stylePlugin: undefined, settings: [], panes, columnSetting: new LayoutSetting() })),
        map(panel => this.panelHandler.buildSettings(new PanelPage({ id: undefined, layoutType: 'grid', displayType: 'page', site: this.siteName, gridItems: [], layoutSetting: new LayoutSetting(), rowSettings: [], panels: [ panel ] })))
      ).subscribe(panelSettings => {
        subject.next(panelSettings.find(s => s.name === 'panels').attributes[0].attributes.find(s => s.name === 'panes').attributes);
        subject.complete();
      });
    });
    return subject;*/
  }
  buildSelectOptionItems(settings: Array<AttributeValue>, metadata: Map<string, any>) {
    /*this.toObject(settings).pipe(
      switchMap(r => this.urlGeneratorService.getUrl(r.url, r.params, metadata).pipe(
        map(url => [r, url])
      )),
      map<[Rest, string], Rest>(([r, url]) => new Rest({ ...r, url }))
    ).subscribe(r => {
      this.pageBuilderFacade.loadRestData(`${metadata.get('tag')}`, r);
    });
    return this.store.pipe(
      select(selectDataset(`${metadata.get('tag')}`)),
      filter(d => d !== undefined),
      map(d => [d, d.results.map(r => this.tokenizerService.generateGenericTokens(r))]),
      map<[Dataset, Array<Map<string, any>>],[Dataset, Array<Map<string,any>>, SelectMapping]>(([d, tokens]) => [d, tokens, (new SelectMapping(JSON.parse((metadata.get('snippet') as Snippet).content)))]),
      map(([d, tokens, mapping]) => tokens.map((t,i) => new SelectOption({ dataItem: d.results[i], value: mapping.value === '[.]'  ? this.attributeSerializer.serialize(d.results[i], 'value') : this.attributeSerializer.serialize(this.tokenizerService.replaceTokens(mapping.value, t), 'value'), label: this.tokenizerService.replaceTokens(mapping.label, t) })))
    );*/
    return of([]);
  }
  getBindings(settings: Array<AttributeValue>, type: string, metadata?: Map<string, any>): Observable<Array<ContentBinding>> {
    if(type === 'context') {
      return this.toObject(settings).pipe(
        map(ds => ds.params ? ds.params.reduce((p, c) => ([ ...p, ...(c.mapping.type === 'form' ? [ new ContentBinding({ id: `form__${c.mapping.value.split('.', 2)[0].trim()}`, type: 'context' }) ] : []) ]), []): [])
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
    return of({ autocomplete: { input: '' } });
  }
}