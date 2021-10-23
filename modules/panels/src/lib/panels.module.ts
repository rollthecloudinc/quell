import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { DefaultDataServiceConfig, DefaultHttpUrlGenerator, DefaultPluralizer, EntityCollectionDataService, EntityDataService, EntityDefinitionService, EntityServices, Pluralizer } from '@ngrx/data';
import { entityMetadata } from './entity-metadata';
import { PanelPageLinkedlistComponent } from './components/panelpage-linkedlist/panelpage-linkedlist.component';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { NoopDataService } from 'utils';
import { MaterialModule } from 'material';
import { AttributeSerializerService } from 'attributes';
import { ContentPlugin, ContentPluginManager, CONTENT_PLUGIN } from 'content';
import { panelContentPluginFactory, panelsBridgeFactory, datasourceContentPluginFactory } from './panels.factories';
import { PanelContentHandler } from './handlers/panel-content.handler';
import { PanelEditorComponent } from './plugins/panel/panel-editor/panel-editor.component';
import { PanelSelectorComponent } from './plugins/panel/panel-selector/panel-selector.component';
import { PanelPageState } from './models/state.models';
import { BridgeBuilderPluginManager } from 'bridge';
import { S3DataService, Aws3Module } from 'aws3';
import { CrudAdaptorPluginManager, CrudModule } from 'crud';
// import { PanelsStateContextResolver } from './contexts/panels-state-context.resolver';
import { ContextPluginManager } from 'context';
import { DatasourceContentHandler } from './handlers/datasource-content.handler';
import { DatasourceEditorComponent } from './plugins/datasource/datasource-editor/datasource-editor.component';
import { DatasourceModule } from 'datasource';
import { PanelPage } from './models/panels.models';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthFacade, AuthModule } from 'auth';
// import { PanelsStateContextEditorComponent } from './components/panels-state-context-editor/panels-state-context-editor.component';

@NgModule({
  declarations: [PanelPageLinkedlistComponent, PanelEditorComponent, PanelSelectorComponent, DatasourceEditorComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    DatasourceModule,
    AuthModule,
    Aws3Module,
    CrudModule
  ],
  exports: [
    PanelPageLinkedlistComponent,
    PanelEditorComponent, 
    PanelSelectorComponent,
    DatasourceEditorComponent
  ],
  providers: [
    { provide: PanelContentHandler, useClass: PanelContentHandler },
    //{ provide: PanelContentHandler, useClass: PanelContentHandler },
    { provide: CONTENT_PLUGIN, useFactory: panelContentPluginFactory, multi: true, deps: [ PanelContentHandler ] },
    { provide: CONTENT_PLUGIN, useFactory: datasourceContentPluginFactory, multi: true, deps: [ DatasourceContentHandler ] },
    { provide: Pluralizer, useClass: DefaultPluralizer }
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
    http: HttpClient,
    pluralizer: Pluralizer,
    dataServiceConfig: DefaultDataServiceConfig,
    crud: CrudAdaptorPluginManager
    /*ctxm: ContextPluginManager,
    panelsStateContextResolver: PanelsStateContextResolver*/
  ) {
    eds.registerMetadataMap(entityMetadata);
    entityDataService.registerService('PanelPageState', new NoopDataService<PanelPageState>('PanelPageState'));
    // Just for testing - data service will be configurable. - different service for separate ops ie. search vs. save
    entityDataService.registerService('PanelPage', new S3DataService<PanelPage>('PanelPage', http, new DefaultHttpUrlGenerator(pluralizer), crud, dataServiceConfig));
    contentPlugins.forEach(p => cpm.register(p));
    bpm.register(panelsBridgeFactory(es, attributesSerialzer));
    // ctxm.register(panelsStateContextFactory(panelsStateContextResolver));
    // console.log('register panel page state');
  }
}
