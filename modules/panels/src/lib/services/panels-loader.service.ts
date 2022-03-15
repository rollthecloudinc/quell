import { Injectable } from "@angular/core";
import { EntityCollectionService, EntityServices } from "@ngrx/data";
import { AttributeValue } from '@ng-druid/attributes';
import { forkJoin, iif, Observable, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { PanelContentHandler } from "../handlers/panel-content.handler";
import { Pane, Panel, PanelPage } from "../models/panels.models";

@Injectable({
  providedIn: 'root'
})
export class PanelsLoaderService {
  get panelPageService(): EntityCollectionService<PanelPage> {
    return this.es.getEntityCollectionService('PanelPage');
  }
  constructor(
    private es: EntityServices,
    private panelHandler: PanelContentHandler
  ) {
  }
  reducePage(pp: PanelPage): Array<Observable<[number, number, PanelPage]>> {
    return pp.panels.reduce((p, c, i) => this.reducePanels(p, c, i), []);
  }
  reducePanels(p: Array<Observable<[number, number, PanelPage]>>, c: Panel, i: number): Array<Observable<[number, number, PanelPage]>> {
    return [ ...p, ...c.panes.reduce((p2, c2, i2) => this.reducePanes(p2, c2, i2).map(o => o.pipe(map(([i3, pp]) => [i, i3, pp]))), []) ];
  }
  reducePanes(p: Array<Observable<[number, PanelPage]>>, c: Pane, i: number): Array<Observable<[number, PanelPage]>> {
    return [ 
      ...p,
      ...(
        c.contentPlugin === 'panel' ? 
        [
          this.nestedPage$(c).pipe(
            map(pp => [i, pp])
          )
        ] : 
        []
      ) 
    ] as Array<Observable<[number, PanelPage]>>;
  }
  nestedPage$(p: Pane): Observable<PanelPage> {
    console.log('get nested panel page');
    return p.linkedPageId && p.linkedPageId !== '' ? this.getByKey(p.linkedPageId).pipe(tap(() => console.log(`get(${p.linkedPageId})`))) : this.getEmbedded(p.settings).pipe(tap(() => console.log('toObject()')));
  }
  remapNested(p: PanelPage, nested: Array<[number, number, PanelPage]>): void {
    nested.forEach(([index1, index2, np]) => {
      p.panels[index1].panes[index2].nestedPage = np;
    });
  }
  getByKey(key: string): Observable<PanelPage> {
    return this.panelPageService.getByKey(key).pipe(
      map(p => new PanelPage(p)),
      switchMap(p => iif(
        () => this.reducePage(p).length > 0,
        forkJoin(this.reducePage(p)).pipe(
          tap(nested => this.remapNested(p, nested)),
          map(() => p)
        ),
        of(p)
      ))
    );
  }
  getEmbedded(settings: Array<AttributeValue>): Observable<PanelPage> {
    return this.panelHandler.toObject(settings).pipe(
      map<PanelPage, PanelPage>(p => new PanelPage(p)),
      switchMap(p => iif<PanelPage, PanelPage>(
        () => this.reducePage(p as PanelPage).length > 0,
        forkJoin(this.reducePage(p as PanelPage)).pipe(
          tap(nested => this.remapNested(p as PanelPage, nested)),
          map(() => p)
        ),
        of(p)
      ))
    );
  }
}