import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { AliasLoadingStrategy } from 'alias';
import { catchError, defaultIfEmpty, map, tap } from "rxjs/operators";
import { EntityServices } from "@ngrx/data";
import { Router, RouterStateSnapshot, UrlMatcher, UrlSegment, UrlTree } from '@angular/router';
import { AlienAlias } from "../models/alienalias.models";
import { loadRemoteModule } from "@angular-architects/module-federation";

@Injectable()
export class AlienaliasLoadingStrategy implements AliasLoadingStrategy {
  routesLoaded = false;
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
  isLoaded() {
    return this.routesLoaded;
  }
  load(): Observable<boolean> {
    return this.alienAliasService.getWithQuery(`site=${encodeURIComponent(`{"term":{"site.keyword":{"value":"${this.siteName}"}}}`)}&path=${encodeURIComponent(`{"wildcard":{"path.keyword":{"value":"*"}}}`)}`).pipe(
      map(aa => aa.filter(a => a.path !== undefined && a.path !== '')),
      map(aa => aa.map(a => new AlienAlias(a)).sort((a, b) => {
        if(a.path.split('/').length === b.path.split('/').length) {
          return a.path.split('/')[a.path.split('/').length - 1] > b.path.split('/')[b.path.split('/').length - 1] ? -1 : 1;
        }
        return a.path.split('/').length > b.path.split('/').length ? -1 : 1;
      })),
      tap(aa => {
        // const target = this.router.config.find(r => r.path === '');

        // const matchers = pp.map(p => [ this.createEditMatcher(p), this.createMatcher(p) ]).reduce<Array<UrlMatcher>>((p, c) => [ ...p, ...c ], []);
        // const paths = aa.map(a => a.path);

        /*this.router.config.unshift({ matcher: this.createPageMatcher(paths), loadChildren: () => {
          return loadRemoteModule({
            type: aa.type,
            remoteEntry: 'http://localhost:3000/remoteEntry.js',
            exposedModule: './Module'
          }).then(m => m.FlightsModule);
        } });*/

        aa.forEach(a => {
          //console.log(`register alias ${p.path}`);
          // target.children.push({ matcher: this.createEditMatcher(p), component: PagealiasRouterComponent /*EditPanelPageComponent*/ });
          this.router.config.unshift({ 
            matcher: this.createMatcher(a),
            // path: a.path,
            loadChildren: () => {
              console.log(`loading remote module remote entry ${a.remoteEntry} module ${a.moduleName}`);
              return loadRemoteModule({
                type: 'module',
                // remoteEntry: 'http://localhost:3000/remoteEntry.js',
                remoteEntry: a.remoteEntry,
                exposedModule: './Module'
              }).then(m => /*m.FlightsModule*/ m[a.moduleName]);
            }
          });
        });
        this.routesLoaded = true;
      }),
      tap(() => console.log('alien alias routes loaded')),
      map(() => true),
      defaultIfEmpty(true)
    );
    // return of(true);
  }

  createMatcher(a: AlienAlias): UrlMatcher {
    return (url: UrlSegment[]) => {
      if(('/' + url.map(u => u.path).join('/')).indexOf(a.path) === 0) {
        console.log(`matcher matched: ${a.path}`);
        const pathLen = a.path.substr(1).split('/').length;
        return {
          consumed: [ url[0] /* @todo: consume number of pieces in a.path */ ],
          /*posParams: url.reduce<{}>((p, c, index) => {
            if(index === 0) {
              return { ...p, alienAliasId: new UrlSegment(a.id , {}) }
            } else if(index > pathLen - 1) {
              return { ...p, [`arg${index - pathLen}`]: new UrlSegment(c.path, {}) };
            } else {
              return { ...p };
            }
          }, {})*/
        };
      } else {
        return null;
      }
    };
  }

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

  /*createPageMatcher(paths: Array<string>): UrlMatcher  {
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
  }*/

}