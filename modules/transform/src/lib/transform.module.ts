import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'material';
import { DatasourcePluginManager, DatasourceModule } from 'datasource';
import { TransformSelectComponent } from './components/transform-select/transform-select.component';
import { TransformMergeComponent } from './components/transform-merge/transform-merge.component';
import { selectDatasourcePluginFactory, mergeDatasourcePluginFactory } from './transform.factories';

@NgModule({
  declarations: [
    TransformSelectComponent,
    TransformMergeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    DatasourceModule
  ],
  exports: [
    TransformSelectComponent,
    TransformMergeComponent
  ]
})
export class TransformModule { 
  constructor(
    dpm: DatasourcePluginManager
  ) {
    [
      selectDatasourcePluginFactory(),
      mergeDatasourcePluginFactory()
    ].forEach(p => dpm.register(p));
  }
}
