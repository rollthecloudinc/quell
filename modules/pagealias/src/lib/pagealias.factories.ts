import { EntityServices } from '@ngrx/data';
import { Router } from '@angular/router';
import { PagealiasPlugin } from './models/pagealias.models';
import { PagealiasLoadingStrategy } from './strategies/pagealias-loading-strategy';
import { PagealiasMatchingStrategy } from './strategies/pagealias-matching-strategy';
import { PagealiasRedirectHandler } from './strategies/pagealias-redirect-handler';

export const pagealiasFactory = (siteName: string, es: EntityServices, router: Router) => {
  const loadingStrategy = new PagealiasLoadingStrategy(siteName, es, router);
  const matchingStrategy = new PagealiasMatchingStrategy(siteName, es, router);
  const redirectHandler = new PagealiasRedirectHandler(siteName, es, router);
  return new PagealiasPlugin({ id: 'panels', title: 'Panels', loadingStrategy, matchingStrategy, redirectHandler });
};