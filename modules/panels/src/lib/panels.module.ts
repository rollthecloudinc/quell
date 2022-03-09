import { CommonModule } from '@angular/common';
import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { DefaultDataServiceConfig, DefaultHttpUrlGenerator, DefaultPluralizer, EntityCollectionDataService, EntityDataService, EntityDefinitionService, EntityServices, Pluralizer } from '@ngrx/data';
import { entityMetadataFactory } from './entity-metadata';
import { PanelPageLinkedlistComponent } from './components/panelpage-linkedlist/panelpage-linkedlist.component';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { EMBEDDABLE_COMPONENT, NoopDataService } from '@ng-druid/utils';
import { MaterialModule } from '@ng-druid/material';
import { AttributeSerializerService } from 'attributes';
import { ContentPlugin, ContentPluginManager, CONTENT_PLUGIN } from 'content';
import { panelContentPluginFactory, panelsBridgeFactory, datasourceContentPluginFactory } from './panels.factories';
import { PanelContentHandler } from './handlers/panel-content.handler';
import { PanelEditorComponent } from './plugins/panel/panel-editor/panel-editor.component';
import { PanelSelectorComponent } from './plugins/panel/panel-selector/panel-selector.component';
import { PanelPageState } from './models/state.models';
import { BridgeBuilderPluginManager } from 'bridge';
import { Aws3Module } from 'aws3';
import { AwosModule } from 'awos';
import { CrudAdaptorPluginManager, CrudModule, CrudDataService, CrudDataHelperService } from 'crud';
// import { PanelsStateContextResolver } from './contexts/panels-state-context.resolver';
import { ContextPluginManager } from 'context';
import { DatasourceContentHandler } from './handlers/datasource-content.handler';
import { DatasourceEditorComponent } from './plugins/datasource/datasource-editor/datasource-editor.component';
import { DatasourceModule } from 'datasource';
import { PanelPage, PanelPageListItem, PanelsSettings } from './models/panels.models';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthFacade, AuthModule } from 'auth';
import { PanelPageForm } from './models/form.models';
import { PageBuilderEffects } from './features/page-builder/page-builder.effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import * as fromPageBuilder from './features/page-builder/page-builder.reducer';
import { PANELS_SETTINGS } from './panels.tokens';
// import { PanelsStateContextEditorComponent } from './components/panels-state-context-editor/panels-state-context-editor.component';

@NgModule({
  declarations: [PanelPageLinkedlistComponent, PanelEditorComponent, PanelSelectorComponent, DatasourceEditorComponent ],
  imports: [
    CommonModule,
    // HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forFeature(fromPageBuilder.pageBuilderFeatureKey, fromPageBuilder.reducer),
    EffectsModule.forFeature([PageBuilderEffects]),
    MaterialModule,
    DatasourceModule,
    AuthModule,
    Aws3Module,
    AwosModule,
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
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin<string>>,
    @Inject(PANELS_SETTINGS) panelsSettings: PanelsSettings,
    eds: EntityDefinitionService,
    cpm: ContentPluginManager,
    entityDataService: EntityDataService,
    bpm: BridgeBuilderPluginManager,
    es: EntityServices,
    attributesSerialzer: AttributeSerializerService,
    crud: CrudAdaptorPluginManager,
    entityDefinitionService: EntityDefinitionService,
    /*ctxm: ContextPluginManager,
    panelsStateContextResolver: PanelsStateContextResolver*/
    crudDataHelper: CrudDataHelperService
  ) {
    const entityMetadata = entityMetadataFactory(platformId, panelsSettings);
    eds.registerMetadataMap(entityMetadata);
    entityDataService.registerService('PanelPageState', new NoopDataService<PanelPageState>('PanelPageState'));
    // Just for testing - data service will be configurable. - different service for separate ops ie. search vs. save
    entityDataService.registerService('PanelPage', new CrudDataService<PanelPage>('PanelPage', crud, entityDefinitionService, crudDataHelper));
    entityDataService.registerService('PanelPageListItem', new CrudDataService<PanelPageListItem>('PanelPageListItem', crud, entityDefinitionService, crudDataHelper));
    contentPlugins.forEach(p => cpm.register(p));
    bpm.register(panelsBridgeFactory(es, attributesSerialzer));
    // ctxm.register(panelsStateContextFactory(panelsStateContextResolver));
    // console.log('register panel page state');
    // Experimental - form testing
    entityDataService.registerService('PanelPageForm', new CrudDataService<PanelPageForm>('PanelPageForm', crud, entityDefinitionService, crudDataHelper));
  }
}
