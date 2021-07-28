import { Injectable } from '@angular/core';
import { AttributeValue } from 'attributes';
import { Pane, Panel, PanelPage } from 'panels';
import { forkJoin, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { StyleHandler } from 'style';
import { PanelContentHandler } from '../panel-content.handler';

@Injectable()
export class TabsStyleHandler implements StyleHandler {
  constructor(
    private panelHandler: PanelContentHandler 
  ) {}
  alterResolvedPanes(
    settings: Array<AttributeValue>,
    resolvedPanes: Array<Pane>, 
    originMappings: Array<number>,
    resolvedContexts: Array<any>
  ): Observable<[Array<Pane>, Array<number>, Array<any>]> {
    // For now use the first pane inside a nested panel as the label. -- this is just a proof of concept at the moment
    console.log('TabsStyleHandler::alterResolvedPanes');
    console.log(resolvedPanes);
    console.log(originMappings);
    console.log(resolvedContexts);
    // @todo: support linked pages
    /*const nestedPages$: Array<Observable<[Pane, PanelPage]>> = resolvedPanes.map(p => p.contentPlugin === 'panel' ? this.panelHandler.toObject(p.settings).pipe(map<PanelPage, [Pane, PanelPage]>(page => [p, page])) : undefined).filter(p => p !== undefined);
    return forkJoin(nestedPages$).pipe(
      map(pages => pages.reduce((p, [cp, c]) => [ 
        ...p, 
        new Pane({ ...cp, settings: this.panelHandler.buildSettings(new PanelPage({ ...c, panels: [ new Panel({ ...c.panels[0], panes: [ new Pane({ ...c.panels[0].panes[0] }) ] }) ] })) }), 
        new Pane({ ...cp, settings: this.panelHandler.buildSettings(new PanelPage({ ...c, panels: [ ...c.panels.map((p2, i) => i !== 0 ? p2 : new Panel({ ...p2, panes: p2.panes.map(p3 => new Pane(p3)).filter((_, i2) => i2 !== 0) })) ] })) }) 
      ], [])),
      tap(rebuiltPanes => {
        console.log('Rebuilt Panes');
        console.log(rebuiltPanes);
      }),
      map(rebuiltPanes => [ rebuiltPanes, originMappings, resolvedContexts])
    );*/
    return of([resolvedPanes, originMappings, resolvedContexts]);
  }
}