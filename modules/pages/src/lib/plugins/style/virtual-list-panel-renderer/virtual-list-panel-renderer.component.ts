import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import * as uuid from 'uuid';
import { AttributeValue, AttributeMatcherService } from 'attributes';
import { CONTENT_PLUGIN, ContentPlugin, ContentPluginManager } from 'content';
import { TokenizerService } from 'token';
import { InlineContext, InlineContextResolverService } from 'context';
import { Pane, Panel, PanelContentHandler, PanelResolverService, StyleResolverService, PaneDatasourceService } from 'panels';
import { filter, concatMap, map, take, skip, tap, switchMap } from 'rxjs/operators';
import { VirtualListItem } from '../../../models/style/virtual-list.models';

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

  @Input()
  resolvedContexts = [];

  @Input()
  resolvedContext = {};

  @Input()
  panel: Panel;

  trackByMapping: (index: number, pane: VirtualListItem) => string;

  // private contentPlugins: Array<ContentPlugin>;
  private trackByTpl: string;

  constructor(
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    private panelHandler: PanelContentHandler,
    private tokenizerService: TokenizerService,
    private attributeMatcher: AttributeMatcherService,
    private cpm: ContentPluginManager,
    private panelResolverService: PanelResolverService,
    private inlineContextResolver: InlineContextResolverService,
    private styleResolverService: StyleResolverService,
    public paneDatasource: PaneDatasourceService
  ) {
    // this.contentPlugins = contentPlugins;
    /*this.trackByMapping = (index: number, vlp: VirtualListItem): string => {
      // Changing this to root lookup for now...
      // return this.tokenizerService.replaceTokens(this.trackByTpl, this.tokenizerService.generateGenericTokens(pane.contexts[0].data));
      console.log(`index is: ${index}`);
      console.log(vlp);
      console.log(this.tokenizerService.generateGenericTokens(vlp.resolvedContext));
      return this.tokenizerService.replaceTokens(this.trackByTpl, this.tokenizerService.generateGenericTokens(vlp.resolvedContext));
    };*/
  }

  ngOnInit(): void {

    this.paneDatasource.pageChange$.pipe(
      skip(1),
      switchMap(page => this.panelResolverService.resolvePanes({ panes: this.originPanes.map(p => new Pane({ ...p, metadata: new Map<string, any>([ ...(p.metadata ? p.metadata : []), ['page', page], ['limit', this.paneDatasource.pageSize] ]) })), contexts: this.contexts, resolvedContext: this.resolvedContext })),
      switchMap(({ resolvedPanes, originMappings /*, resolvedContexts */ }) => this.styleResolverService.alterResolvedPanes({ panel: this.panel, resolvedPanes, originMappings /*, resolvedContexts */ })),
    ).subscribe(({ resolvedPanes, originMappings /*, resolvedContexts */ }) => {
      this.originMappings = originMappings;
      this.paneDatasource.panes = resolvedPanes;
    });

    this.paneDatasource.panes = this.panes;
    // this.trackByTpl = '[_root.id]'; // this needs to be a style option.

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
