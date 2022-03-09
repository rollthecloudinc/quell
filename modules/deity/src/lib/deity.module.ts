import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EntityDatasourceComponent } from './components/entity-datasource/entity-datasource.component';
import { EntityDataSourceFormComponent } from './components/entity-datasource-form/entity-datasource-form.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@ng-druid/material';
import { ContextModule, ParamContextExtractorService } from 'context';
import { AttributeSerializerService } from 'attributes';
import { DatasourcePluginManager } from 'datasource';
import { entityDatasourcePluginFactory } from './deity.factories';
import { DparamModule } from 'dparam';
import { UrlGeneratorService } from 'durl';
import { EntityServices } from '@ngrx/data';

@NgModule({
  declarations: [
    EntityDatasourceComponent,
    EntityDataSourceFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    ContextModule,
    DparamModule
  ],
  exports: [
    EntityDatasourceComponent,
    EntityDataSourceFormComponent
  ]
})
export class DeityModule { 
  constructor(
    dpm: DatasourcePluginManager,
    paramContextExtractor: ParamContextExtractorService,
    attributeSerializer: AttributeSerializerService,
    urlGenerator: UrlGeneratorService,
    es: EntityServices,
  ) {
    dpm.register(entityDatasourcePluginFactory(paramContextExtractor, attributeSerializer, urlGenerator, es));
  }
}
