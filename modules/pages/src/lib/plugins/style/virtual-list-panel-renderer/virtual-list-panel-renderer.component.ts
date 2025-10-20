import { Component, OnInit, Input } from '@angular/core';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { TokenizerService } from '@rollthecloudinc/token';
import { InlineContext } from '@rollthecloudinc/context';
import { Pane, Panel, PanelResolverService, StyleResolverService, PaneDatasourceService } from '@rollthecloudinc/panels';
import { skip, switchMap } from 'rxjs/operators';

@Component({
    selector: 'classifieds-ui-virtual-list-panel-renderer',
    templateUrl: './virtual-list-panel-renderer.component.html',
    styleUrls: ['./virtual-list-panel-renderer.component.scss'],
    providers: [PaneDatasourceService],
    standalone: false
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
  resolvedContext = {};

  @Input()
  panel: Panel;

  trackByMapping: (index: number, pane: Pane) => string;
  private trackByTpl: string;

  constructor(
    private tokenizerService: TokenizerService,
    private panelResolverService: PanelResolverService,
    private styleResolverService: StyleResolverService,
    public paneDatasource: PaneDatasourceService
  ) {
    /*this.trackByMapping = (index: number, pane: Pane): string => {
      // Changing this to root lookup for now...
      // return this.tokenizerService.replaceTokens(this.trackByTpl, this.tokenizerService.generateGenericTokens(pane.contexts[0].data));
      console.log(`track by item: ${this.tokenizerService.replaceTokens(this.trackByTpl, this.tokenizerService.generateGenericTokens(pane.resolvedContext))}`);
      const tokens = this.tokenizerService.generateGenericTokens(pane.resolvedContext);
      const mapping = this.tokenizerService.replaceTokens(this.trackByTpl, tokens);
      console.log(`track by: ${mapping} | name: ${tokens.get('._root.name')}`);
      return mapping;
    };*/
  }

  ngOnInit(): void {

    this.paneDatasource.pageChange$.pipe(
      skip(1),
      switchMap(page => this.panelResolverService.resolvePanes({ panes: this.originPanes.map(p => new Pane({ ...p, metadata: new Map<string, any>([ ...(p.metadata ? p.metadata : []), ['page', page], ['limit', this.paneDatasource.pageSize] ]) })), contexts: this.contexts, resolvedContext: this.resolvedContext })),
      switchMap(({ resolvedPanes, originMappings }) => this.styleResolverService.alterResolvedPanes({ panel: this.panel, resolvedPanes, originMappings })),
    ).subscribe(({ resolvedPanes, originMappings }) => {
      this.originMappings = originMappings;
      this.paneDatasource.panes = resolvedPanes;
    });

    this.paneDatasource.panes = this.panes;
    this.trackByTpl = '[._root.id]';

  }

}
