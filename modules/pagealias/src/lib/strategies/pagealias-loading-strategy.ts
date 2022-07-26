import { Observable } from "rxjs";
import { AliasLoadingStrategy } from '@rollthecloudinc/alias';
import { map, tap } from "rxjs/operators";
import { PanelPage } from '@rollthecloudinc/panels';
import { EntityServices } from "@ngrx/data";
import { Router } from '@angular/router';
import { createEditMatcher, createMatcher, EditPanelPageComponent, PanelPageRouterComponent } from '@rollthecloudinc/pages';

export class PagealiasLoadingStrategy implements AliasLoadingStrategy {
  routesLoaded = false;
  get panelPageListItemsService() {
    return this.es.getEntityCollectionService('PanelPageListItem');
  }
  constructor(
    private siteName: string,
    private es: EntityServices,
    private router: Router
  ) {
  }
  isLoaded() {
    return this.routesLoaded;
  }
  load(): Observable<boolean> {
    return this.panelPageListItemsService.getWithQuery(`site=${encodeURIComponent(`{"term":{"site.keyword":{"value":"${this.siteName}"}}}`)}&path=${encodeURIComponent(`{"wildcard":{"path.keyword":{"value":"*"}}}`)}`).pipe(
      map(pp => pp.filter(p => p.path !== undefined && p.path !== '')),
      map(pp => pp.map(o => new PanelPage(o)).sort((a, b) => {
        if(a.path.split('/').length === b.path.split('/').length) {
          return a.path.split('/')[a.path.split('/').length - 1] > b.path.split('/')[b.path.split('/').length - 1] ? -1 : 1;
        }
        return a.path.split('/').length > b.path.split('/').length ? -1 : 1;
      })),
      tap(pp => pp.sort((a, b) => a.path.length > b.path.length ? 1 : -1)),
      tap(pp => {
        pp.forEach(p => {
          this.router.config.unshift({ matcher: createMatcher(p), component: PanelPageRouterComponent, data: { panelPageListItem: p } });
          this.router.config.unshift({ matcher: createEditMatcher(p), component: EditPanelPageComponent, data: { panelPageListItem: p } });
        });
        this.routesLoaded = true;
      }),
      tap(() => console.log('panels routes loaded')),
      map(() => true)
    );
  }

}