import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'material';
import { AttributeSerializerService } from 'attributes';
import { ContextModule } from 'context';
import { DatasourcePluginManager, DatasourceEvaluator, DatasourceModule } from 'datasource';
import { loopDatasourcePluginFactory } from './loop.factories';
import { LoopDatasourceFormComponent } from './components/loop-datasource-form/loop-datasource-form.component';
import { LoopDatasourceComponent } from './components/loop-datasource/loop-datasource.component';

@NgModule({
  declarations: [
    LoopDatasourceFormComponent,
    LoopDatasourceComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    ContextModule,
    DatasourceModule
  ],
  exports: [
    LoopDatasourceFormComponent,
    LoopDatasourceComponent
  ]
})
export class LoopModule { 
  constructor(
    dpm: DatasourcePluginManager,
    attributeSerializer: AttributeSerializerService,
    datasourceEvaluator: DatasourceEvaluator
  ) {
    [
      loopDatasourcePluginFactory(attributeSerializer, datasourceEvaluator)
    ].forEach(p => dpm.register(p));
  }
}
