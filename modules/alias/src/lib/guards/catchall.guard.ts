import { Inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlMatcher, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import { of, forkJoin , iif } from 'rxjs';
import { SITE_NAME } from 'utils';
import { map, switchMap, catchError, tap, filter } from 'rxjs/operators';
/*import { PanelPageListItem, PanelPage } from 'panels';
import { PanelPageRouterComponent } from '../components/panel-page-router/panel-page-router.component';
import { EditPanelPageComponent } from '../components/edit-panel-page/edit-panel-page.component';*/
//import * as qs from 'qs';
import { AliasPluginManager } from '../services/alias-plugin-manager.service';

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

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    console.log('catch all alias hit');

    /*if (this.routesLoaded) {
      console.log('false');
      return new Promise(res => {
        this.apm.getPlugins().subscribe(pp => {
          pp.forEach(p => {
            p.matchingStrategy.match(state).subscribe(r => {
              if (r !== undefined) {
                res(false);
                p.redirectHandler.redirect(route, state);
              }
            });
          });
        });
      });
    }*/

    return new Promise(res => {
      this.apm.getPlugins().pipe(
        switchMap(plugins => forkJoin(Array.from(plugins).map(([_, p]) => p.loadingStrategy.load()))),
        tap(() => this.routesLoaded = true),
        switchMap(() => this.apm.getPlugins())
      ).subscribe(pp => {
        pp.forEach(p => {
          p.matchingStrategy.match(state).subscribe(r => {
            if (r !== undefined) {
              res(false);
              p.redirectHandler.redirect(route, state);
            }
          });
        });
      });
    });
  }

}
