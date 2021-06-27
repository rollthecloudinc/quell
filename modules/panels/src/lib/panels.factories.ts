import { EntityServices } from '@ngrx/data';
import { Router } from '@angular/router';
import { PanelsAliasPlugin } from './models/alias.models';
import {  PanelsLoadingStrategy } from './strategies/panels-loading-strategy';
import { PanelsMatchingStrategy } from './strategies/panels-matching-strategy';

export const panelsAliasFactory = (es: EntityServices, router: Router) => {
  const loadingStrategy = new PanelsLoadingStrategy(es, router);
  const matchingStrategy = new PanelsMatchingStrategy(es, router);
  return new PanelsAliasPlugin({ id: 'panels', title: 'Panels', loadingStrategy, matchingStrategy });
};