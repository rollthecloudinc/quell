import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import * as uuid from 'uuid';
import { AttributeValue, AttributeMatcherService } from 'attributes';
import { CONTENT_PLUGIN, ContentPlugin, ContentPluginManager } from 'content';
import { TokenizerService } from 'token';
import { InlineContext } from 'context';
import { Pane } from 'panels';
import { PaneDatasourceService } from '../../../services/pane-datasource.service';
import { filter, concatMap, map, take, skip, tap, switchMap } from 'rxjs/operators';
import { PanelContentHandler } from '../../../handlers/panel-content.handler';

@Component({
  selector: 'classifieds-ui-virtual-list-panel-renderer',
  templateUrl: './virtual-list-panel-renderer.component.html',
  styleUrls: ['./virtual-list-panel-renderer.component.scss'],
  providers: [ PaneDatasourceService ]
})
export class VirtualListPanelRendererComponent implements OnInit {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  panes: Array<Pane> = [];

  @Input()
  originPanes: Array<Pane>;

  @Input()
  originMappings: Array<number> = [];

  @Input()
  contexts: Array<InlineContext>;

  trackByMapping: (index: number, pane: Pane) => string;

  // private contentPlugins: Array<ContentPlugin>;
  private trackByTpl: string;

  constructor(
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    private panelHandler: PanelContentHandler,
    private tokenizerService: TokenizerService,
    private attributeMatcher: AttributeMatcherService,
    private cpm: ContentPluginManager,
    public paneDatasource: PaneDatasourceService
  ) {
    // this.contentPlugins = contentPlugins;
    this.trackByMapping = (index: number, pane: Pane): string => {
      return this.tokenizerService.replaceTokens(this.trackByTpl, this.tokenizerService.generateGenericTokens(pane.contexts[0].data));
    };
  }

  ngOnInit(): void {

    /*const staticPanes = this.originPanes.reduce<Array<Pane>>((p, c) => {
      const plugin = this.contentPlugins.find(cp => cp.name === c.contentPlugin);
      if(plugin.handler === undefined || !plugin.handler.isDynamic(c.settings)) {
        return [ ...p, c ];
      } else {
        return [ ...p ];
      }
    }, []);*/

    this.paneDatasource.pageChange$.pipe(
      skip(1),
      tap(page => console.log(page)),
      filter(() => this.originPanes !== undefined && this.originPanes[0] !== undefined),
      switchMap(page => this.cpm.getPlugin(this.originPanes[0].contentPlugin).pipe(
        map(p => [p, page])
      )),
      filter<[ContentPlugin, number]>(([contentPlugin, page]) => contentPlugin !== undefined && contentPlugin.handler !== undefined && this.originPanes.length > 0 && contentPlugin.handler.isDynamic(this.originPanes[0].settings)),
      concatMap(([contentPlugin, page]) =>
        this.cpm.getPlugins(this.originPanes.reduce<Array<string>>((p, c) => {
          return p.findIndex(cp => cp === c.contentPlugin) === -1 ? [ ...p, c.contentPlugin] : [ ...p ];
        }, [])).pipe(
          map(plugins => this.originPanes.filter(p => plugins.get(p.contentPlugin).handler === undefined || !plugins.get(p.contentPlugin).handler.isDynamic(p.settings))),
          switchMap(staticPanes => contentPlugin.handler.buildDynamicItems(this.originPanes[0].settings, new Map([ ...(this.originPanes[0].metadata === undefined ? [] : this.originPanes[0].metadata), ['tag', uuid.v4()], ['page', page], ['limit', this.paneDatasource.pageSize], ['panes', staticPanes], ['contexts', this.contexts] ])))
        )
      ),
      map(items => this.panelHandler.fromPanes(items)),
      map(panes => this.panelHandler.wrapPanel(panes).panes),
    ).subscribe((panes: Array<Pane>) => {
      this.paneDatasource.panes = panes;
    });

    this.paneDatasource.panes = this.panes;
    this.trackByTpl = this.attributeMatcher.matchAttribute('trackBy', this.originPanes[0].settings).value;

  }

  /*trackByName(index: number, pane: Pane): string {
    // return pane.name;
    // return pane.contexts[0].data.id;
    return this.tokenizerService.replaceTokens(this.tokenizerService.generateGenericTokens());
  }*/

  mergeContexts(contexts: Array<InlineContext>): Array<InlineContext> {
    if(contexts === undefined && this.contexts === undefined) {
      return undefined;
    } else if(contexts !== undefined && this.contexts !== undefined) {
      return [ ...contexts, ...this.contexts ];
    } else if(contexts !== undefined) {
      return contexts;
    } else {
      return this.contexts;
    }
    //return [ ...( this.contexts !== undefined ? this.contexts.map(c => new InlineContext(c)) : [] ), ...( contexts !== undefined ? contexts.map(c => new InlineContext(c)) : [] ) ];
  }

}
