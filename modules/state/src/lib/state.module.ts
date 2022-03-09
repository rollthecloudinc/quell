import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContextPluginManager } from 'context';
import { ContextStateEditorComponent } from './components/context-state-editor/context-state-editor.component';
import { ContextStateFormComponent } from './components/context-state-form/context-state-form.component';
import { StateContextResolver } from './contexts/state-context.resolver';
import { stateBridgeFactory, stateContextFactory } from './state.factories';
import { EntityDataService, EntityDefinitionService, EntityServices } from '@ngrx/data';
import { entityMetadata } from './entity-metadata';
import { NoopDataService } from '@ng-druid/utils';
import { GlobalState } from './models/state.models';
import { BridgeBuilderPluginManager } from 'bridge';
import { AttributeSerializerService } from '@ng-druid/attributes';

@NgModule({
  declarations: [
    ContextStateEditorComponent,
    ContextStateFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [],
  providers: [
    StateContextResolver
  ]
})
export class StateModule { 
  constructor(
    eds: EntityDefinitionService,
    entityDataService: EntityDataService,
    cpm: ContextPluginManager,
    es: EntityServices, 
    attributeSerializer: AttributeSerializerService,
    bpm: BridgeBuilderPluginManager,
    stateContextResolver: StateContextResolver
  ) {
    eds.registerMetadataMap(entityMetadata);
    entityDataService.registerService('GlobalState', new NoopDataService<GlobalState>('GlobalState'));
    cpm.register(stateContextFactory(stateContextResolver));
    bpm.register(stateBridgeFactory(es, attributeSerializer));
  }
}

