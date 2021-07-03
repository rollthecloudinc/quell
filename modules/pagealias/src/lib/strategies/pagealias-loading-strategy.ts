import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { AliasLoadingStrategy } from 'alias';
import { catchError, map, tap } from "rxjs/operators";
import { PanelPage } from 'panels';
import { EntityServices } from "@ngrx/data";
import { Router, RouterStateSnapshot, UrlMatcher, UrlSegment, UrlTree } from '@angular/router';
import { PagealiasRouterComponent } from '../components/pagealias-router/pagealias-router.component';

@Injectable()
export class PagealiasLoadingStrategy implements AliasLoadingStrategy {
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
        // const target = this.router.config.find(r => r.path === '');

        // const matchers = pp.map(p => [ this.createEditMatcher(p), this.createMatcher(p) ]).reduce<Array<UrlMatcher>>((p, c) => [ ...p, ...c ], []);
        const paths = pp.map(p => p.path);

        this.router.config.unshift({ matcher: this.createPageMatcher(paths), loadChildren: () => {
          return import('pages').then(m => m.PagesModule);
        } });

        //pp.forEach(p => {
          //console.log(`register alias ${p.path}`);
          //target.children.push({ matcher: this.createEditMatcher(p), component: PagealiasRouterComponent /*EditPanelPageComponent*/ });
          //target.children.push({ matcher: this.createMatcher(p), component: PagealiasRouterComponent /*PanelPageRouterComponent*/ });
        //});
        this.routesLoaded = true;
      }),
      tap(() => console.log('panels routes loaded')),
      map(() => true)
    );
    // return of(true);
  }

  /*createMatcher(panelPage: PanelPage): UrlMatcher {
    return (url: UrlSegment[]) => {
      if(('/' + url.map(u => u.path).join('/')).indexOf(panelPage.path) === 0) {
        console.log(`matcher matched: ${panelPage.path}`);
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
  }*/

  /*createEditMatcher(panelPage: PanelPage): UrlMatcher {
    return (url: UrlSegment[]) => {
      if(('/' + url.map(u => u.path).join('/')).indexOf(panelPage.path) === 0 && url.map(u => u.path).join('/').indexOf('/manage') > -1) {
        console.log(`edit matched matched: ${panelPage.path}`);
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
  }*/

  createPageMatcher(paths: Array<string>): UrlMatcher  {
    return (url: UrlSegment[]) => {

      for (let i = 0; i < paths.length; i++) {
        if(('/' + url.map(u => u.path).join('/')).indexOf(paths[i]) === 0) {
          return { consumed: [], posParams: {} };
        }
      }

      if (url.length > 0 && url[0].path === 'pages') {
        console.log('matched page!');
        return {
          consumed: url.slice(0, 1),
          posParams: {}
        };
      } else {
        return null;
      }

    };
  }

}