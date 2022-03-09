import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@ng-druid/material';
import { DatasourcePluginManager, DatasourceModule } from 'datasource';
import { TransformSelectComponent } from './components/transform-select/transform-select.component';
import { TransformMergeComponent } from './components/transform-merge/transform-merge.component';
import { selectDatasourcePluginFactory, mergeDatasourcePluginFactory } from './transform.factories';
import { SelectSourceFormComponent } from './components/select-source-form/select-source-form.component';
import { AttributeSerializerService } from 'attributes';

@NgModule({
  declarations: [
    TransformSelectComponent,
    TransformMergeComponent,
    SelectSourceFormComponent
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
    TransformMergeComponent,
    SelectSourceFormComponent
  ]
})
export class TransformModule { 
  constructor(
    dpm: DatasourcePluginManager,
    attributeSerializer: AttributeSerializerService
  ) {
    [
      selectDatasourcePluginFactory(attributeSerializer),
      mergeDatasourcePluginFactory()
    ].forEach(p => dpm.register(p));
  }
}
