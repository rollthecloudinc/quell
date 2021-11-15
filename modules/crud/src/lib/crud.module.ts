import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AttributeSerializerService } from 'attributes';
import { ContextModule, ParamContextExtractorService } from 'context';
import { DatasourcePluginManager } from 'datasource';
import { DparamModule } from 'dparam';
import { MaterialModule } from 'material';
import { CrudAdaptorDatasourceFormComponent } from './components/crud-adaptor-datasource-form/crud-adaptor-datasource-form.component';
import { CrudAdaptorDatasourceComponent } from './components/crud-adaptor-datasource/crud-adaptor-datasource.component';
import { crudAdaptorDatasourcePluginFactory } from './crud.factories';

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
    paramContextExtractor: ParamContextExtractorService,
    attributeSerializer: AttributeSerializerService,
  ) {
    dpm.register(crudAdaptorDatasourcePluginFactory(paramContextExtractor, attributeSerializer));
  }
}
