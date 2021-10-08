import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'material';
import { DurlModule } from 'durl';
import { DatasourceOptionsComponent } from './components/datasource-options/datasource-options.component';
import { DatasourceFormComponent } from './components/datasource-form/datasource-form.component';
import { DatasourceRendererHostDirective }  from './directives/datasource-renderer-host.directive';
import { DataDatasourceComponent } from './components/data-datasource/data-datasource.component';
import { dataDatasourcePluginFactory } from './datasource.factories';
import { DatasourcePluginManager } from './services/datasource-plugin-manager.service';
import { DataSourceFormComponent } from './components/data-source-form/data-source-form.component';

@NgModule({
  declarations: [
    DatasourceOptionsComponent,
    DatasourceFormComponent,
    DatasourceRendererHostDirective,
    DataDatasourceComponent,
    DataSourceFormComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    DurlModule
  ],
  exports: [
    DatasourceOptionsComponent,
    DatasourceFormComponent,
    DatasourceRendererHostDirective,
    DataDatasourceComponent,
    DataSourceFormComponent
  ]
})
export class DatasourceModule { 
  constructor(
    dpm: DatasourcePluginManager
  ) {
    [
      dataDatasourcePluginFactory()
    ].forEach(p => dpm.register(p));
  }
}
