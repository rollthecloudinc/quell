import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Plugin } from '@ng-druid/plugin';
import { Observable } from 'rxjs';

export interface AliasLoadingStrategy {
  load(): Observable<boolean>;
  isLoaded(): boolean;
}

export interface AliasMatchingStrategy {
  match(state: RouterStateSnapshot): Observable<boolean>;
}

export interface AliasRedirectHandler {
  redirect(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void;
}

export abstract class AliasPlugin<T = string> extends Plugin<T> {
  loadingStrategy: AliasLoadingStrategy;
  matchingStrategy: AliasMatchingStrategy;
  redirectHandler: AliasRedirectHandler;
  constructor(data?: AliasPlugin<T>) {
    super(data);
    if (data) {
      this.loadingStrategy = data.loadingStrategy;
      this.matchingStrategy = data.matchingStrategy;
      this.redirectHandler = data.redirectHandler;
    }
  }
}
