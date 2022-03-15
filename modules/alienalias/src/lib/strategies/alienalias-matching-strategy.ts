import { Injectable } from "@angular/core";
import { iif, Observable, of } from "rxjs";
import { AliasMatchingStrategy } from '@ng-druid/alias';
import { catchError, defaultIfEmpty, map, switchMap, tap } from "rxjs/operators";
import { EntityServices } from "@ngrx/data";
import { Router, RouterStateSnapshot } from '@angular/router';
import { HttpParams } from "@angular/common/http";

@Injectable()
export class AlienaliasMatchingStrategy implements AliasMatchingStrategy {
  siteName = 'ipe'
  get alienAliasService() {
    return this.es.getEntityCollectionService('AlienAlias');
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
    return this.alienAliasService.getWithQuery(matchPathQuery).pipe(
      catchError(e => {
        return of([]);
      }),
      map(aa => aa.reduce((p, c) => p === undefined ? c : p.path.split('/').length < c.path.split('/').length ? c : p , undefined)),
      map(m => !!m),
      defaultIfEmpty(false)
    )
  }

  encodePathComponent(v: string): string {
    return `{"term":{"path.keyword":{"value":"${v}"}}}`;
  }

}