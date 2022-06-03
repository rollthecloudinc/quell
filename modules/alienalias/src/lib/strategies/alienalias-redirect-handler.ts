import { AliasRedirectHandler } from '@rollthecloudinc/alias';
import { map } from "rxjs/operators";
import { EntityServices } from "@ngrx/data";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import * as qs from 'qs'
export class AlienaliasRedirectHandler implements AliasRedirectHandler {
  get alienAliasService() {
    return this.es.getEntityCollectionService('AlienAlias');
  }
  constructor(
    private siteName: string,
    private es: EntityServices,
    private router: Router
  ) {
  }

  redirect(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if(state.url.indexOf('pages') > -1) {
      console.log(`redirect: ${state.url}`);
      this.router.navigateByUrl(state.url);
    } else {
      const matchPathQuery = 'path=' + state.url.substr(1).split('/').reduce<Array<string>>((p, c, i) => [ ...p, i === 0 ?  `/${c}`  :  `${p[i-1]}/${c}` ], []).map(p => this.encodePathComponent(p)).join('&path=') + `&site=${encodeURIComponent(`{"term":{"site.keyword":{"value":"${this.siteName}"}}}`)}`;
      this.alienAliasService.getWithQuery(matchPathQuery).pipe(
        map(aa => aa.reduce((p, c) => p === undefined ? c : p.path.split('/').length < c.path.split('/').length ? c : p , undefined)),
        map(a => {
          const argPath = state.url.substr(1).split('/').slice(a.path.split('/').length - 1).join('/');
          return [a, argPath];
        }),
      ).subscribe(([a, argPath]) => {
        // this.router.onSameUrlNavigation.reload;
        // this.router.navigate(['reload']);
        console.log(`nagigvate to: ${a.path}${argPath === '' ? '' : `/${argPath}`}?${qs.stringify(route.queryParams)}`);
        this.router.navigateByUrl(`${a.path}${argPath === '' ? '' : `/${argPath}`}?${qs.stringify(route.queryParams)}`, /* Removed unsupported properties by Angular migration: queryParams, fragment. */ {})
        // this.router.navigateByUrl(`/pages/panelpage/${panelPage.id}${argPath === '' ? '' : `/${argPath}`}?${qs.stringify(route.queryParams)}`, {queryParams: { ...((route as ActivatedRouteSnapshot).queryParams) }, fragment: (route as ActivatedRouteSnapshot).fragment })
      });
    }
  }

  encodePathComponent(v: string): string {
    return `{"term":{"path.keyword":{"value":"${v}"}}}`;
  }

}