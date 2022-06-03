import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { ContextModule, ParamContextExtractorService } from '@rollthecloudinc/context';
import { DataductPluginManager } from '@rollthecloudinc/refinery';
import { CrudAdaptorPluginManager } from './services/crud-adaptor-plugin-manager.service';
import { DatasourcePluginManager } from '@rollthecloudinc/datasource';
import { DparamModule, ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { UrlGeneratorService } from '@rollthecloudinc/durl';
import { MaterialModule } from '@rollthecloudinc/material';
import { CrudAdaptorDatasourceFormComponent } from './components/crud-adaptor-datasource-form/crud-adaptor-datasource-form.component';
import { CrudAdaptorDatasourceComponent } from './components/crud-adaptor-datasource/crud-adaptor-datasource.component';
import { crudAdaptorDatasourcePluginFactory, crudDataductPluginFactory } from './crud.factories';
import { CrudDataHelperService } from './services/crud-data-helper.service';

@NgModule({
  declarations: [
    CrudAdaptorDatasourceComponent,
    CrudAdaptorDatasourceFormComponent
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
    CrudAdaptorDatasourceComponent,
    CrudAdaptorDatasourceFormComponent
  ]
})
export class CrudModule { 
  constructor(
    dpm: DatasourcePluginManager,
    cpm: CrudAdaptorPluginManager,
    ddpm: DataductPluginManager ,
    paramContextExtractor: ParamContextExtractorService,
    attributeSerializer: AttributeSerializerService,
    paramEvaluatorService: ParamEvaluatorService,
    crudDataHelper: CrudDataHelperService,
    urlGenerator: UrlGeneratorService
  ) {
    dpm.register(crudAdaptorDatasourcePluginFactory(paramContextExtractor, attributeSerializer, cpm, paramEvaluatorService, crudDataHelper, urlGenerator));
    ddpm.register(crudDataductPluginFactory({ crudDataHelper, attributeSerializer }));
  }
}
