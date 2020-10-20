import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import * as uuid from 'uuid';
import { AttributeValue } from '@classifieds-ui/attributes';
import { CONTENT_PLUGIN, ContentPlugin } from '@classifieds-ui/content';
import { Pane } from '../../../models/page.models';
import { PaneDatasourceService } from '../../../services/pane-datasource.service';
import { filter, concatMap, map, take, skip, tap } from 'rxjs/operators';
import { PanelContentHandler } from '../../../handlers/panel-content.handler';
import { InlineContext } from '../../../models/context.models';

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

  private contentPlugins: Array<ContentPlugin>;

  constructor(
    @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    private panelHandler: PanelContentHandler,
    public paneDatasource: PaneDatasourceService
  ) {
    this.contentPlugins = contentPlugins;
  }

  ngOnInit(): void {

    const staticPanes = this.originPanes.reduce<Array<Pane>>((p, c) => {
      const plugin = this.contentPlugins.find(cp => cp.name === c.contentPlugin);
      if(plugin.handler === undefined || !plugin.handler.isDynamic(c.settings)) {
        return [ ...p, c ];
      } else {
        return [ ...p ];
      }
    }, []);

    this.paneDatasource.pageChange$.pipe(
      skip(1),
      tap(page => console.log(page)),
      filter(() => this.originPanes !== undefined && this.originPanes[0] !== undefined),
      map(page => [this.contentPlugins.find(c => c.name === this.originPanes[0].contentPlugin, ), page]),
      filter<[ContentPlugin, number]>(([contentPlugin, page]) => contentPlugin !== undefined && contentPlugin.handler !== undefined && this.originPanes.length > 0 && contentPlugin.handler.isDynamic(this.originPanes[0].settings)),
      concatMap(([contentPlugin, page]) => contentPlugin.handler.buildDynamicItems(this.originPanes[0].settings, new Map([ ...(this.originPanes[0].metadata === undefined ? [] : this.originPanes[0].metadata), ['tag', uuid.v4()], ['page', page], ['panes', staticPanes], ['contexts', this.contexts] ]))),
      map(items => this.panelHandler.fromPanes(items)),
      map(panes => this.panelHandler.wrapPanel(panes).panes),
    ).subscribe((panes: Array<Pane>) => {
      this.paneDatasource.panes = panes;
    });
    this.paneDatasource.panes = this.panes;

  }

  trackByName(index: number, pane: Pane): string {
    return pane.name;
  }

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
