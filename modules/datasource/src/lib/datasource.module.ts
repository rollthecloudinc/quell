import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'material';
import { DurlModule } from 'durl';
import { DatasourceOptionsComponent } from './components/datasource-options/datasource-options.component';
import { DatasourceFormComponent } from './components/datasource-form/datasource-form.component';
import { DatasourceRendererHostDirective }  from './directives/datasource-renderer-host.directive';

@NgModule({
  declarations: [
    DatasourceOptionsComponent,
    DatasourceFormComponent,
    DatasourceRendererHostDirective
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
    DatasourceRendererHostDirective
  ]
})
export class DatasourceModule { }
