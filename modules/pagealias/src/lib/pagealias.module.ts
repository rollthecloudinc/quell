import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { EntityDefinitionService, EntityServices } from '@ngrx/data';
import { AliasPluginManager } from '@ng-druid/alias';
import { SITE_NAME } from '@ng-druid/utils';
import { PagealiasRouterComponent } from './components/pagealias-router/pagealias-router.component';
// import { entityMetadata } from './entity-metadata';
import { pagealiasFactory } from './pagealias.factories';

@NgModule({
  declarations: [
    PagealiasRouterComponent
  ],
  imports: [
    CommonModule
  ],
  exports: []
})
export class PagealiasModule { 
  constructor(
    apm: AliasPluginManager,
    router: Router,
    @Inject(SITE_NAME) siteName: string,
    // eds: EntityDefinitionService,
    es: EntityServices
  ) {
    // eds.registerMetadataMap(entityMetadata);
    apm.register(pagealiasFactory(es, router));
  }
}
