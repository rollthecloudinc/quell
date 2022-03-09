import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { EntityDataService, EntityDefinitionService, EntityServices } from '@ngrx/data';
import { AliasPluginManager } from 'alias';
import { CrudAdaptorPluginManager, CrudDataHelperService, CrudDataService } from 'crud';
import { SITE_NAME } from '@ng-druid/utils';
import { ALIENALIAS_SETTINGS } from './alienalias.tokens';
import { alienaliasFactory } from './alienalias.factories';
import { entityMetadataFactory } from './entity-metadata';
import { AlienAlias, AlienaliasSettings } from './models/alienalias.models';

@NgModule({
  declarations: [
  ],
  imports: [
  ],
  exports: [
  ]
})
export class AlienaliasModule { 
  constructor(
    @Inject(SITE_NAME) siteName: string,
    @Inject(PLATFORM_ID) platformId: object,
    @Inject(ALIENALIAS_SETTINGS) alienalisSettings: AlienaliasSettings,
    apm: AliasPluginManager,
    router: Router,
    eds: EntityDefinitionService,
    es: EntityServices,
    entityDataService: EntityDataService,
    crud: CrudAdaptorPluginManager,
    crudDataHelper: CrudDataHelperService
  ) {
    const entityMetadata = entityMetadataFactory(platformId, alienalisSettings);
    eds.registerMetadataMap(entityMetadata);
    apm.register(alienaliasFactory(es, router));
    entityDataService.registerService('AlienAlias', new CrudDataService<AlienAlias>('AlienAlias', crud, eds, crudDataHelper));
  }
}
