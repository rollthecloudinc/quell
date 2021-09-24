import { Injectable } from "@angular/core";
import { Pane, PanelPage } from "../models/panels.models";
import { forkJoin, Observable, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { PanelsLoaderService } from "./panels-loader.service";

type VisitorFunc<T> = ({ pane }: { pane: Pane, panelPage: PanelPage, ancestoryWithSelf: Array<number> }) => Observable<T>;

@Injectable({
  providedIn: 'root'
})
export class PanelsWalkerService {

  constructor(
    private panelsLoaderService: PanelsLoaderService
  ) {}

  walkPageHierarchy<T>(
    { panelPage, visitorFunc, defaultv, ancestory }: { panelPage: PanelPage, visitorFunc: VisitorFunc<Iterable<T>>, defaultv: Iterable<T>, ancestory: Array<number> }
  ): Observable<Iterable<T>> {
    return new Observable<Iterable<T>>(obs => {
      const len = panelPage.panels.length;
      const visitors$: Array<Observable<Iterable<T>>> = [];
      for (let i = 0; i < len; i++) {
        const len2 = panelPage.panels[i].panes.length;
        for (let j = 0; j < len2; j++) {
          visitors$.push(visitorFunc({ pane: panelPage.panels[i].panes[j], panelPage, ancestoryWithSelf: [ ...ancestory, i, j] }));
          if(panelPage.panels[i].panes[j].nestedPage && panelPage.panels[i].panes[j].nestedPage.panels && panelPage.panels[i].panes[j].nestedPage.panels.length !== 0) {
            visitors$.push(this.walkPageHierarchy<T>({ panelPage, visitorFunc, defaultv, ancestory: [ ...ancestory, i, j ] }));
          } else if(panelPage.panels[i].panes[j].contentPlugin === 'panel' ) {
            visitors$.push(this.panelsLoaderService.nestedPage$(panelPage.panels[i].panes[j]).pipe(
              switchMap(nestedPage => this.walkPageHierarchy<T>({ panelPage: nestedPage, visitorFunc, defaultv, ancestory: [ ...ancestory, i, j ] }))
            ));
          }
        }
      }
      forkJoin(visitors$).pipe(
        map(groups => groups.reduce<Iterable<T>>((p, c) => [ ...p, ...c ] as any, defaultv)),
        tap(values => {
          obs.next(values);
          obs.complete();
        })
      ).subscribe();
    });
  }
}