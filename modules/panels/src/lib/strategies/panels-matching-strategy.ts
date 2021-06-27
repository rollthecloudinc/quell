import { Injectable } from "@angular/core";
import { iif, Observable, of } from "rxjs";
import { AliasMatchingStrategy } from 'alias';
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { PanelPage } from "../models/panels.models";
import { EntityServices } from "@ngrx/data";
import { Router, RouterStateSnapshot, UrlMatcher, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { PanelsPageRouterComponent } from '../components/panels-page-router/panels-page-router.component';
import { HttpParams } from "@angular/common/http";

@Injectable()
export class PanelsMatchingStrategy implements AliasMatchingStrategy {
  siteName = 'ipe'
  get panelPageListItemsService() {
    return this.es.getEntityCollectionService('PanelPageListItem');
  }
  constructor(
    private es: EntityServices,
    private router: Router
    // siteName: string
  ) {
    // this.siteName = siteName;
  }

  match(state: RouterStateSnapshot): Observable<UrlTree> {
    const matchPathQuery = 'path=' + state.url.substr(1).split('/').reduce<Array<string>>((p, c, i) => [ ...p, i === 0 ?  `/${c}`  :  `${p[i-1]}/${c}` ], []).join('&path=') + `&site=${encodeURIComponent(this.siteName)}`;
    return this.panelPageListItemsService.getWithQuery(matchPathQuery).pipe(
      catchError(e => {
        return of([]);
      }),
      map(pages => pages.reduce((p, c) => p === undefined ? c : p.path.split('/').length < c.path.split('/').length ? c : p , undefined)),
      switchMap(pp => iif(
        () => pp !== undefined,
        of(pp).pipe(
          map(panelPage => {
            // const argPath = state.url.substr(1).split('/').slice(panelPage.path.split('/').length - 1).join('/');
            // return [panelPage, argPath];
            //const tree = new UrlTree();
            // tree.queryParams = {};
            // tree.queryParamMap
            // tree.queryParams = new Params();
            // tree.root = new UrlSegmentGroup([ ...panelPage.path.substr(1).split('/').map(s => new UrlSegment(s, {}) ) ], {});
            return this.router.createUrlTree([panelPage.path]);
          }),
        ),
        of(undefined)
      ))
      // map(() => new UrlTree()) // @todo: Build url tree from panel page.
    )
  }

}