import { Injectable } from "@angular/core";
import { iif, Observable, of } from "rxjs";
import { AliasMatchingStrategy } from 'alias';
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { PanelPage } from 'panels';
import { EntityServices } from "@ngrx/data";
import { Router, RouterStateSnapshot, UrlMatcher, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { PagealiasRouterComponent } from '../components/pagealias-router/pagealias-router.component';
import { HttpParams } from "@angular/common/http";

@Injectable()
export class PagealiasMatchingStrategy implements AliasMatchingStrategy {
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

  match(state: RouterStateSnapshot): Observable<boolean> {
    const matchPathQuery = 'path=' + state.url.substr(1).split('/').reduce<Array<string>>((p, c, i) => [ ...p, i === 0 ?  `/${c}` : `${p[i-1]}/${c}` ], []).map(p => this.encodePathComponent(p)).join('&path=') + `&site=${encodeURIComponent(`{"term":{"site.keyword":{"value":"${this.siteName}"}}}`)}`;
    return this.panelPageListItemsService.getWithQuery(matchPathQuery).pipe(
      catchError(e => {
        return of([]);
      }),
      map(pages => pages.reduce((p, c) => p === undefined ? c : p.path.split('/').length < c.path.split('/').length ? c : p , undefined)),
      map(m => !!m || state.url.indexOf('pages') > -1)
    )
  }

  encodePathComponent(v: string): string {
    return `{"term":{"path.keyword":{"value":"${v}"}}}`;
  }

}