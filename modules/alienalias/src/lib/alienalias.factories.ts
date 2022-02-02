import { EntityServices } from '@ngrx/data';
import { Router } from '@angular/router';
import { AlienaliasPlugin } from './models/alienalias.models';
import { AlienaliasLoadingStrategy } from './strategies/alienalias-loading-strategy';
import { AlienaliasMatchingStrategy } from './strategies/alienalias-matching-strategy';
import { AlienaliasRedirectHandler } from './strategies/alienalias-redirect-handler';

export const alienaliasFactory = (es: EntityServices, router: Router) => {
  const loadingStrategy = new AlienaliasLoadingStrategy(es, router);
  const matchingStrategy = new AlienaliasMatchingStrategy(es, router);
  const redirectHandler = new AlienaliasRedirectHandler(es, router);
  return new AlienaliasPlugin({ id: 'module', title: 'module', loadingStrategy, matchingStrategy, redirectHandler });
};