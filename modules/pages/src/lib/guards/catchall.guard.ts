import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlMatcher, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import { of, forkJoin , iif } from 'rxjs';
import { map, switchMap, catchError, tap, filter } from 'rxjs/operators';
import { PanelPageListItem, PanelPage } from '../models/page.models';
import { PanelPageRouterComponent } from '../components/panel-page-router/panel-page-router.component';
import { EditPanelPageComponent } from '../components/edit-panel-page/edit-panel-page.component';
import * as qs from 'qs';

@Injectable()
export class CatchAllGuard implements CanActivate {

  routesLoaded = false;

  panelPageListItemsService: EntityCollectionService<PanelPageListItem>;

  constructor(
    private router: Router,
    es: EntityServices
  ) {
    this.panelPageListItemsService = es.getEntityCollectionService('PanelPageListItem');
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    return new Promise(res => {
      const matchPathQuery = 'path=' + state.url.substr(1).split('/').reduce<Array<string>>((p, c, i) => [ ...p, i === 0 ?  `/${c}`  :  `${p[i-1]}/${c}` ], []).join('&path=');
      forkJoin([
        iif(
          () => !this.routesLoaded,
          this.panelPageListItemsService.getAll().pipe(
            map(pp => pp.filter(p => p.path !== undefined && p.path !== '')),
            map(pp => pp.map(o => new PanelPage(o)).sort((a, b) => {
              if(a.path.split('/').length === b.path.split('/').length) {
                return a.path.split('/')[a.path.split('/').length - 1] > b.path.split('/')[b.path.split('/').length - 1] ? -1 : 1;
              }
              return a.path.split('/').length > b.path.split('/').length ? -1 : 1;
            })),
            tap(pp => {
              const target = this.router.config.find(r => r.path === '');
              target.children = [];
              pp.forEach(p => {
                target.children.push({ matcher: this.createEditMatcher(p), component: EditPanelPageComponent });
                target.children.push({ matcher: this.createMatcher(p), component: PanelPageRouterComponent });
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
          map(pages => pages.reduce((p, c) => p === undefined ? c : p.path.split('/').length < c.path.split('/').length ? c : p , undefined)),
          map(panelPage => {
            const argPath = state.url.substr(1).split('/').slice(panelPage.path.split('/').length - 1).join('/');
            return [panelPage, argPath];
          })
        )
      ]).pipe(
        map(([pp, [panelPage, argPath]]) => [panelPage, argPath])
      ).subscribe(([panelPage, argPath]) => {
        res(false);
        this.router.navigateByUrl(`/${panelPage.path}${argPath === '' ? '' : `/${argPath}`}?${qs.stringify(route.queryParams)}`, {queryParams: { ...((route as ActivatedRouteSnapshot).queryParams) }, fragment: (route as ActivatedRouteSnapshot).fragment });
      });
    });
  }

  createMatcher(panelPage: PanelPage): UrlMatcher    {
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

}
