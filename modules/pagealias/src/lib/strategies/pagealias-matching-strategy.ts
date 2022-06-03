import { Observable, of } from "rxjs";
import { AliasMatchingStrategy } from '@rollthecloudinc/alias';
import { catchError, map } from "rxjs/operators";
import { EntityServices } from "@ngrx/data";
import { Router, RouterStateSnapshot } from '@angular/router';

export class PagealiasMatchingStrategy implements AliasMatchingStrategy {
  get panelPageListItemsService() {
    return this.es.getEntityCollectionService('PanelPageListItem');
  }
  constructor(
    private siteName: string,
    private es: EntityServices,
    private router: Router
  ) {
  }

  match(state: RouterStateSnapshot): Observable<boolean> {
    let url = state.url;
    if (url.indexOf('?') !== -1) {
      url = state.url.substr(0, url.indexOf('?'));
    }
    const matchPathQuery = 'path=' + url.substr(1).split('/').reduce<Array<string>>((p, c, i) => [ ...p, i === 0 ?  `/${c}` : `${p[i-1]}/${c}` ], []).map(p => this.encodePathComponent(p)).join('&path=') + `&site=${encodeURIComponent(`{"term":{"site.keyword":{"value":"${this.siteName}"}}}`)}`;
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