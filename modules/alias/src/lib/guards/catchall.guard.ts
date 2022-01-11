import { Inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlMatcher, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import { of, forkJoin , iif } from 'rxjs';
import { SITE_NAME } from 'utils';
import { map, switchMap, catchError, tap, filter, defaultIfEmpty } from 'rxjs/operators';
/*import { PanelPageListItem, PanelPage } from 'panels';
import { PanelPageRouterComponent } from '../components/panel-page-router/panel-page-router.component';
import { EditPanelPageComponent } from '../components/edit-panel-page/edit-panel-page.component';*/
//import * as qs from 'qs';
import { AliasPluginManager } from '../services/alias-plugin-manager.service';
import { AliasPlugin } from '../models/alias.models';

@Injectable()
export class CatchAllGuard implements CanActivate {

  routesLoaded = false;

  // panelPageListItemsService: EntityCollectionService<PanelPageListItem>;

  constructor(
    @Inject(SITE_NAME) private siteName: string,
    private router: Router,
    private apm: AliasPluginManager,
    es: EntityServices
  ) {
    // this.panelPageListItemsService = es.getEntityCollectionService('PanelPageListItem');
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<UrlTree | boolean> {
    console.log('catch all alias hit');
    return new Promise(res => {
      this.apm.getPlugins().pipe(
        switchMap(plugins => forkJoin(!this.routesLoaded ? Array.from(plugins).map(([_, p]) => p.loadingStrategy.load()) : []).pipe(
          defaultIfEmpty(undefined)
        )),
        tap(() => this.routesLoaded = true),
        switchMap(() => this.apm.getPlugins()),
        switchMap(plugins => forkJoin(Array.from(plugins).map(([_, p]) => p.matchingStrategy.match(state).pipe(
          map(m => [p, m])
        ))))
      ).subscribe((pp: Array<[AliasPlugin<string>, boolean]>) => {
        console.log(`routes loaded: ${this.routesLoaded ? 'y' : 'n'}`);
        const matchedPlugin = pp.map(([p, m], _) => m ? p : undefined).find(p => p !== undefined);
        if (matchedPlugin !== undefined) {
          console.log(`alias gaurd state: ${state.url}`);
          const urlTree = this.router.parseUrl(state.url);
          // matchedPlugin.redirectHandler.redirect(route, state);
          // res(false);
          res(urlTree);
        } else {
          res(true);
        }
      });
    });
  }
}
