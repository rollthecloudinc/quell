import { Injectable } from "@angular/core";
import { forkJoin, iif, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { PanelPage, Panel, Pane } from "../models/panels.models";
import { PanelPageState, PanelState, PaneState } from "../models/state.models";
import { PanelContentHandler } from '../handlers/panel-content.handler';
import { AttributeValue } from '@ng-druid/attributes';

@Injectable({
  providedIn: 'root'
})
export class PanelStateConverterService {
  constructor(
    private panelHandler: PanelContentHandler
  ) {}
  convertPageToState(pp: PanelPage): Observable<PanelPageState> {
    return of(new PanelPageState()).pipe(
      switchMap(() => forkJoin(
        pp.panels.map(p => this.convertPanelToState(p))
      )),
      map(panels => new PanelPageState({ id: pp.id, panels }))
    );
  }
  convertPanelToState(panel: Panel): Observable<PanelState> {
    return of(new PanelState()).pipe(
      switchMap(() => forkJoin(
        panel.panes.map(p => this.convertPaneToState(p))
      )),
      map(panes => new PanelState({ panes }))
    );
  }
  convertPaneToState(pane: Pane): Observable<PaneState> {
    return of(new PaneState()).pipe(
      switchMap(state => iif(
        () => this.hasNestedPanelPage(pane),
        this.panelHandler.toObject(pane.settings).pipe(
          switchMap(panelPage => this.convertPageToState(panelPage)),
          map(nestedPage => new PaneState({ state: new AttributeValue(), nestedPage }))
        ),
        of(state)
      ))
    );
  }
  hasNestedPanelPage(pane: Pane): boolean {
    return pane.contentPlugin === 'panel' && (pane.linkedPageId === undefined || pane.linkedPageId === null || pane.linkedPageId === '');
  }
}