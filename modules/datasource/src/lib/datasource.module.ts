import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@ng-druid/material';
import { DurlModule } from '@ng-druid/durl';
import { AttributeSerializerService } from '@ng-druid/attributes';
import { DatasourceOptionsComponent } from './components/datasource-options/datasource-options.component';
import { DatasourceFormComponent } from './components/datasource-form/datasource-form.component';
import { DatasourceRendererHostDirective }  from './directives/datasource-renderer-host.directive';
import { DataDatasourceComponent } from './components/data-datasource/data-datasource.component';
import { dataDatasourcePluginFactory, datasourceDatasourcePluginFactory } from './datasource.factories';
import { DatasourcePluginManager } from './services/datasource-plugin-manager.service';
import { DataSourceFormComponent } from './components/data-source-form/data-source-form.component';
import { DatasourceSourceComponent } from './components/datasource-source/datasource-source.component';
import { DatasourceSourceFormComponent } from './components/datasource-source-form/datasource-source-form.component';

@NgModule({
  declarations: [
    DatasourceOptionsComponent,
    DatasourceFormComponent,
    DatasourceRendererHostDirective,
    DataDatasourceComponent,
    DataSourceFormComponent,
    DatasourceSourceComponent,
    DatasourceSourceFormComponent
  ],
  imports: [
    CommonModule,
    // HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    DurlModule
  ],
  exports: [
    DatasourceOptionsComponent,
    DatasourceFormComponent,
    DatasourceRendererHostDirective,
    DataDatasourceComponent,
    DataSourceFormComponent,
    DatasourceSourceComponent,
    DatasourceSourceFormComponent,
  ]
})
export class DatasourceModule { 
  constructor(
    dpm: DatasourcePluginManager,
    attributeSerializer: AttributeSerializerService
  ) {
    [
      dataDatasourcePluginFactory(attributeSerializer),
      datasourceDatasourcePluginFactory(attributeSerializer)
    ].forEach(p => dpm.register(p));
  }
}
