import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EntityDatasourceComponent } from './components/entity-datasource/entity-datasource.component';
import { EntityDataSourceFormComponent } from './components/entity-datasource-form/entity-datasource-form.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'material';

@NgModule({
  declarations: [
    EntityDatasourceComponent,
    EntityDataSourceFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule
  ],
  exports: [
    EntityDatasourceComponent,
    EntityDataSourceFormComponent
  ]
})
export class DeityModule { }
