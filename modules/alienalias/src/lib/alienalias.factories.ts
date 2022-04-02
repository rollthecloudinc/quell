import { EntityServices } from '@ngrx/data';
import { Router } from '@angular/router';
import { AlienaliasPlugin } from './models/alienalias.models';
import { AlienaliasLoadingStrategy } from './strategies/alienalias-loading-strategy';
import { AlienaliasMatchingStrategy } from './strategies/alienalias-matching-strategy';
import { AlienaliasRedirectHandler } from './strategies/alienalias-redirect-handler';

export const alienaliasFactory = (siteName: string, es: EntityServices, router: Router) => {
  const loadingStrategy = new AlienaliasLoadingStrategy(siteName, es, router);
  const matchingStrategy = new AlienaliasMatchingStrategy(siteName, es, router);
  const redirectHandler = new AlienaliasRedirectHandler(siteName, es, router);
  return new AlienaliasPlugin({ id: 'module', title: 'module', loadingStrategy, matchingStrategy, redirectHandler });
};