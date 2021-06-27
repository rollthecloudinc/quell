import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { AliasLoadingStrategy } from 'alias';
import { catchError, map, tap } from "rxjs/operators";
import { PanelPage } from "../models/panels.models";
import { EntityServices } from "@ngrx/data";
import { Router, RouterStateSnapshot, UrlMatcher, UrlSegment, UrlTree } from '@angular/router';
import { PanelsPageRouterComponent } from '../components/panels-page-router/panels-page-router.component';

@Injectable()
export class PanelsLoadingStrategy implements AliasLoadingStrategy {
  routesLoaded = false;
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
  isLoaded() {
    return this.routesLoaded;
  }
  load(): Observable<boolean> {
    return this.panelPageListItemsService.getWithQuery(`site=${encodeURIComponent(this.siteName)}`).pipe(
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
          console.log(`register alias ${p.path}`);
          target.children.push({ matcher: this.createEditMatcher(p), component: PanelsPageRouterComponent /*EditPanelPageComponent*/ });
          target.children.push({ matcher: this.createMatcher(p), component: PanelsPageRouterComponent /*PanelPageRouterComponent*/ });
        });
        this.routesLoaded = true;
      }),
      tap(() => console.log('panels routes loaded')),
      map(() => true)
    );
    // return of(true);
  }

  match(state: RouterStateSnapshot): Observable<UrlTree> {
    const matchPathQuery = 'path=' + state.url.substr(1).split('/').reduce<Array<string>>((p, c, i) => [ ...p, i === 0 ?  `/${c}`  :  `${p[i-1]}/${c}` ], []).join('&path=') + `&site=${encodeURIComponent(this.siteName)}`;
    return this.panelPageListItemsService.getWithQuery(matchPathQuery).pipe(
      catchError(e => {
        return of([]);
      }),
      map(pages => pages.reduce((p, c) => p === undefined ? c : p.path.split('/').length < c.path.split('/').length ? c : p , undefined)),
      map(panelPage => {
        const argPath = state.url.substr(1).split('/').slice(panelPage.path.split('/').length - 1).join('/');
        return [panelPage, argPath];
      }),
      map(() => new UrlTree()) // @todo: Build url tree from panel page.
    )
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

}