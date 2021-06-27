import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { EntityDefinitionService, EntityServices } from '@ngrx/data';
import { AliasPluginManager } from 'alias';
import { SITE_NAME } from 'utils';
import { PanelsPageRouterComponent } from './components/panels-page-router/panels-page-router.component';
import { entityMetadata } from './entity-metadata';
import * as panelFactories from './panels.factories';

@NgModule({
  declarations: [
    PanelsPageRouterComponent
  ],
  imports: [
    CommonModule
  ],
  exports: []
})
export class PanelsModule { 
  constructor(
    apm: AliasPluginManager,
    router: Router,
    @Inject(SITE_NAME) siteName: string,
    eds: EntityDefinitionService,
    es: EntityServices
  ) {
    eds.registerMetadataMap(entityMetadata);
    apm.register(panelFactories.panelsAliasFactory(es, router));
  }
}
