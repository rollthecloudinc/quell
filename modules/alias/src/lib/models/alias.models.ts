import { RouterStateSnapshot, UrlTree } from '@angular/router';
import { Plugin } from 'plugin';
import { Observable } from 'rxjs';

export interface AliasLoadingStrategy {
  load(): Observable<boolean>;
  isLoaded(): boolean;
}

export interface AliasMatchingStrategy {
  match(state: RouterStateSnapshot): Observable<undefined | UrlTree>;
}

export abstract class AliasPlugin<T = string> extends Plugin<T> {
  loadingStrategy: AliasLoadingStrategy;
  matchingStrategy: AliasMatchingStrategy;
  constructor(data?: AliasPlugin<T>) {
    super(data);
    if (data) {
      this.loadingStrategy = data.loadingStrategy;
      this.matchingStrategy = data.matchingStrategy;
    }
  }
}
