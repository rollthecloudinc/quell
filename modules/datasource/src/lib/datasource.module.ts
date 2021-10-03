import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'material';
import { DurlModule } from 'durl';
import { DatasourceOptionsComponent } from './components/datasource-options/datasource-options.component';

@NgModule({
  declarations: [
    DatasourceOptionsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    DurlModule
  ],
  exports: [
    DatasourceOptionsComponent
  ]
})
export class DatasourceModule { }
