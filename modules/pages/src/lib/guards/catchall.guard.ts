import { Inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlMatcher, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import { of, forkJoin , iif } from 'rxjs';
import { SITE_NAME } from '@ng-druid/utils';
import { map, switchMap, catchError, tap, filter } from 'rxjs/operators';
import { PanelPageListItem, PanelPage } from '@ng-druid/panels';
import { PanelPageRouterComponent } from '../components/panel-page-router/panel-page-router.component';
import { EditPanelPageComponent } from '../components/edit-panel-page/edit-panel-page.component';
import * as qs from 'qs';

@Injectable()
export class CatchAllGuard implements CanActivate {

  routesLoaded = false;

  panelPageListItemsService: EntityCollectionService<PanelPageListItem>;

  constructor(
    @Inject(SITE_NAME) private siteName: string,
    private router: Router,
    es: EntityServices
  ) {
    this.panelPageListItemsService = es.getEntityCollectionService('PanelPageListItem');
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<UrlTree | boolean> {

    return new Promise(res => {
      let url = state.url;
      if (url.indexOf('?') !== -1) {
        url = state.url.substr(0, url.indexOf('?'));
      }
      const matchPathQuery = 'path=' + url.substr(1).split('/').reduce<Array<string>>((p, c, i) => [ ...p, i === 0 ?  `/${c}`  :  `${p[i-1]}/${c}` ], []).map(p => this.encodePathComponent(p)).join('&path=') + `&site=${encodeURIComponent(`{"term":{"site.keyword":{"value":"${this.siteName}"}}}`)}`;
      forkJoin([
        iif(
          () => !this.routesLoaded,
          this.panelPageListItemsService.getWithQuery(`site=${encodeURIComponent(`{"term":{"site.keyword":{"value":"${this.siteName}"}}}`)}&path={"wildcard":{"path.keyword":{"value":"*"}}}`).pipe(
            tap(() => console.log('loaded page list items')),
            map(pp => pp.filter(p => p.path !== undefined && p.path !== '')),
            map(pp => pp.map(o => new PanelPage(o)).sort((a, b) => {
              if(a.path.split('/').length === b.path.split('/').length) {
                return a.path.split('/')[a.path.split('/').length - 1] > b.path.split('/')[b.path.split('/').length - 1] ? -1 : 1;
              }
              return a.path.split('/').length > b.path.split('/').length ? -1 : 1;
            })),
            tap(pp => {
              const target = (this.router.config[0] as any)._loadedConfig.routes;
              pp.forEach(p => {
                target.unshift({ matcher: this.createMatcher(p), component: PanelPageRouterComponent, data: { panelPageListItem: p } });
                target.unshift({ matcher: this.createEditMatcher(p), component: EditPanelPageComponent });
                console.log(`panels matcher: ${p.path}`);
              });
              this.routesLoaded = true;
            }),
            map(() => [])
          ),
          of([])
        ),
        this.panelPageListItemsService.getWithQuery(matchPathQuery).pipe(
          catchError(e => {
            return of([]);
          }),
          tap(() => console.log('loaded specific matched')),
          map(pages => pages.reduce((p, c) => p === undefined ? c : p.path.split('/').length < c.path.split('/').length ? c : p , undefined)),
          map(panelPage => {
            const argPath = state.url.substr(1).split('/').slice(panelPage.path.split('/').length - 1).join('/');
            return [panelPage, argPath];
          })
        )
      ]).pipe(
        map(([pp, [panelPage, argPath]]) => [panelPage, argPath])
      ).subscribe(([panelPage, argPath]) => {
        const targetUrl = `${panelPage.path}${argPath === '' ? '' : `/${argPath}`}?${qs.stringify(route.queryParams)}`;
        const urlTree = this.router.parseUrl(targetUrl);
        console.log(`panels garud navigate: ${panelPage.path}${argPath === '' ? '' : `/${argPath}`}?${qs.stringify(route.queryParams)}`);
        // this.router.navigateByUrl(`${panelPage.path}${argPath === '' ? '' : `/${argPath}`}?${qs.stringify(route.queryParams)}`, /* Removed unsupported properties by Angular migration: queryParams, fragment. */ {});
        // res(true);
        res(urlTree);
      });
    });
  }

  createMatcher(panelPage: PanelPage): UrlMatcher {
    return (url: UrlSegment[]) => {
      if(('/' + url.map(u => u.path).join('/')).indexOf(panelPage.path) === 0) {
        const pathLen = panelPage.path.substr(1).split('/').length;
        return {
          consumed: url,
          posParams: url.reduce<{}>((p, c, index) => {
            if(index === 0) {
              return { ...p, panelPageId: new UrlSegment(panelPage.id , {}) }
            } else if(index > pathLen - 1) {
              return { ...p, [`arg${index - pathLen}`]: new UrlSegment(c.path, {}) };
            } else {
              return { ...p };
            }
          }, {})
        };
      } else {
        return null;
      }
    };
  }

  createEditMatcher(panelPage: PanelPage): UrlMatcher {
    return (url: UrlSegment[]) => {
      if(('/' + url.map(u => u.path).join('/')).indexOf(panelPage.path) === 0 && url.map(u => u.path).join('/').indexOf('/manage') > -1) {
        const pathLen = panelPage.path.substr(1).split('/').length;
        return {
          consumed: url,
          posParams: url.reduce<{}>((p, c, index) => {
            if(index === 0) {
              return { ...p, panelPageId: new UrlSegment(panelPage.id , {}) }
            } else {
              return { ...p };
            }
          }, {})
        };
      } else {
        return null;
      }
    };
  }

  encodePathComponent(v: string): string {
    return `{"term":{"path.keyword":{"value":"${v}"}}}`;
  }

}
