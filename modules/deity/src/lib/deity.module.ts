import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EntityDatasourceComponent } from './components/entity-datasource/entity-datasource.component';
import { EntityDataSourceFormComponent } from './components/entity-datasource-form/entity-datasource-form.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@rollthecloudinc/material';
import { ContextModule, ParamContextExtractorService } from '@rollthecloudinc/context';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { DatasourcePluginManager } from '@rollthecloudinc/datasource';
import { DataductPluginManager } from '@rollthecloudinc/refinery';
import { entityDatasourcePluginFactory, entityDataductPluginFactory } from './deity.factories';
import { DparamModule } from '@rollthecloudinc/dparam';
import { UrlGeneratorService } from '@rollthecloudinc/durl';
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
    ddpm: DataductPluginManager,
    paramContextExtractor: ParamContextExtractorService,
    attributeSerializer: AttributeSerializerService,
    urlGenerator: UrlGeneratorService,
    es: EntityServices,
  ) {
    dpm.register(entityDatasourcePluginFactory(paramContextExtractor, attributeSerializer, urlGenerator, es));
    ddpm.register(entityDataductPluginFactory());
  }
}
