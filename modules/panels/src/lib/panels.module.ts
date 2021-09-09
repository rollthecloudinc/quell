import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { DefaultDataServiceConfig, EntityCollectionDataService, EntityDataService, EntityDefinitionService, EntityServices } from '@ngrx/data';
import { entityMetadata } from './entity-metadata';
import { PanelPageLinkedlistComponent } from './components/panelpage-linkedlist/panelpage-linkedlist.component';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { NoopDataService } from 'utils';
import { MaterialModule } from 'material';
import { AttributeSerializerService } from 'attributes';
import { ContentPlugin, ContentPluginManager, CONTENT_PLUGIN } from 'content';
import { panelContentPluginFactory, panelsBridgeFactory } from './panels.factories';
import { PanelContentHandler } from './handlers/panel-content.handler';
import { PanelEditorComponent } from './plugins/panel/panel-editor/panel-editor.component';
import { PanelSelectorComponent } from './plugins/panel/panel-selector/panel-selector.component';
import { PanelPageState } from './models/state.models';
import { BridgeBuilderPluginManager } from 'bridge';
// import { PanelsStateContextResolver } from './contexts/panels-state-context.resolver';
import { ContextPluginManager } from 'context';
// import { PanelsStateContextEditorComponent } from './components/panels-state-context-editor/panels-state-context-editor.component';

@NgModule({
  declarations: [PanelPageLinkedlistComponent, PanelEditorComponent, PanelSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    PanelPageLinkedlistComponent,
    PanelEditorComponent, 
    PanelSelectorComponent
  ],
  providers: [
    { provide: PanelContentHandler, useClass: PanelContentHandler },
    { provide: CONTENT_PLUGIN, useFactory: panelContentPluginFactory, multi: true, deps: [ PanelContentHandler ] },
  ]
})
export class PanelsModule { 
  constructor(
    @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin<string>>,
    eds: EntityDefinitionService,
    cpm: ContentPluginManager,
    entityDataService: EntityDataService,
    bpm: BridgeBuilderPluginManager,
    es: EntityServices,
    attributesSerialzer: AttributeSerializerService,
    /*ctxm: ContextPluginManager,
    panelsStateContextResolver: PanelsStateContextResolver*/
  ) {
    eds.registerMetadataMap(entityMetadata);
    entityDataService.registerService('PanelPageState', new NoopDataService<PanelPageState>('PanelPageState'));
    contentPlugins.forEach(p => cpm.register(p));
    bpm.register(panelsBridgeFactory(es, attributesSerialzer));
    // ctxm.register(panelsStateContextFactory(panelsStateContextResolver));
    // console.log('register panel page state');
  }
}
