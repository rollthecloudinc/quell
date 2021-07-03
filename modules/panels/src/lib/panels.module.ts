import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EntityDefinitionService } from '@ngrx/data';
import { entityMetadata } from './entity-metadata';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: []
})
export class PanelsModule { 
  constructor(
    eds: EntityDefinitionService,
  ) {
    eds.registerMetadataMap(entityMetadata);
  }
}
