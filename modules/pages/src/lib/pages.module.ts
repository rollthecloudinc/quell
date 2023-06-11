import { NgModule, APP_INITIALIZER, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, UrlSegment, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MarkdownModule, MarkdownComponent } from 'ngx-markdown';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularSplitModule } from 'angular-split';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MaterialModule } from '@rollthecloudinc/material';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { NgxAngularQueryBuilderModule } from '@rollthecloudinc/ngx-angular-query-builder';
import { MediaModule } from '@rollthecloudinc/media';
import { UtilsModule, EMBEDDABLE_COMPONENT  } from '@rollthecloudinc/utils';
import { TokenizerService, TokenModule } from '@rollthecloudinc/token';
import { AttributeSerializerService, AttributesModule } from '@rollthecloudinc/attributes';
import { LayoutModule } from '@rollthecloudinc/layout';
import { RestModule } from '@rollthecloudinc/rest';
import { SnippetModule } from '@rollthecloudinc/snippet';
import { CONTENT_PLUGIN, ContentPluginManager, ContentPlugin } from '@rollthecloudinc/content';
import { CONTEXT_PLUGIN, ContextManagerService, ContextModule, ContextPluginManager, ResolvedContextPluginManager } from '@rollthecloudinc/context';
// import { TaxonomyModule } from 'taxonomy';
// import { STYLE_PLUGIN } from '@rollthecloudinc/style';
// import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { GridsterModule } from 'angular-gridster2';
import { DefaultDataServiceConfig, DefaultHttpUrlGenerator, EntityDataService, EntityDefinitionService, Pluralizer } from '@ngrx/data';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { entityMetadata } from './entity-metadata';
import { ContentSelectorComponent } from './components/content-selector/content-selector.component';
import { ContentSelectionHostDirective } from './directives/content-selection-host.directive';
/*import { StoreModule } from '@ngrx/store';
import * as fromPageBuilder from './features/page-builder/page-builder.reducer';
import { EffectsModule } from '@ngrx/effects';
import { PageBuilderEffects } from './features/page-builder/page-builder.effects';*/
import { SnippetPaneRendererComponent } from './plugins/snippet/snippet-pane-renderer/snippet-pane-renderer.component';
import { ContentEditorComponent, EditablePaneComponent } from './components/content-editor/content-editor.component';
import { SnippetEditorComponent } from './plugins/snippet/snippet-editor/snippet-editor.component';
import { PanelPageRouterComponent } from './components/panel-page-router/panel-page-router.component';
import { CreatePanelPageComponent } from './components/create-panel-page/create-panel-page.component';
import { EditPanelPageComponent } from './components/edit-panel-page/edit-panel-page.component';
import { SnippetContentHandler } from './handlers/snippet-content.handler';
import { snippetContentPluginFactory, attributeContentPluginFactory, mediaContentPluginFactory/*, panelContentPluginFactory,*/, restContentPluginFactory, sliceContentPluginFactory, pageContextFactory, restContextFactory, formContextFactory, tabsStylePluginFactory, paneStateContextFactory, pageStateContextFactory, formParamPluginFactory, formResolvedContextPluginFactory, pagesFormBridgeFactory, formSerializationEntityCrudAdaptorPluginFactory, formDatasourcePluginFactory } from './pages.factories';
import { AttributeSelectorComponent } from './plugins/attribute/attribute-selector/attribute-selector.component';
import { AttributeContentHandler } from './handlers/attribute-content.handler';
import { AttributeEditorComponent } from './plugins/attribute/attribute-editor/attribute-editor.component';
import { AttributePaneRendererComponent } from './plugins/attribute/attribute-pane-renderer/attribute-pane-renderer.component';
import { MediaContentHandler } from './handlers/media-content.handler';
// import { PanelContentHandler } from './handlers/panel-content.handler';
import { MediaEditorComponent } from './plugins/media/media-editor/media-editor.component';
import { MediaPaneRendererComponent } from './plugins/media/media-pane-renderer/media-pane-renderer.component';
import { RenderingEditorComponent } from './components/rendering-editor/rendering-editor.component';
// import { PanelSelectorComponent } from './plugins/panel/panel-selector/panel-selector.component';
// import { PanelEditorComponent } from './plugins/panel/panel-editor/panel-editor.component';
import { StyleSelectorComponent } from './components/style-selector/style-selector.component';
import { GalleryEditorComponent } from './plugins/style/gallery-editor/gallery-editor.component';
import { GalleryPanelRendererComponent } from './plugins/style/gallery-panel-renderer/gallery-panel-renderer.component';
import { DatasourceSelectorComponent } from './plugins/datasource/datasource-selector/datasource-selector.component';
import { RestEditorComponent } from './plugins/rest/rest-editor/rest-editor.component';
import { RestFormComponent } from './components/rest-form/rest-form.component';
import { RestContentHandler } from './handlers/rest-content-handler.service';
import { RestPaneRendererComponent } from './plugins/rest/rest-pane-renderer/rest-pane-renderer.component';
import { VirtualListPanelRendererComponent } from './plugins/style/virtual-list-panel-renderer/virtual-list-panel-renderer.component';
import { SliceContentHandler } from './handlers/slice-content.handler';
import { SliceEditorComponent } from './plugins/slice/slice-editor/slice-editor.component';
import { SliceFormComponent } from './components/slice-form/slice-form.component';
import { SelectionComponent } from './components/selection/selection.component';
import { RulesDialogComponent } from './components/rules-dialog/rules-dialog.component';
import { PageRouterLinkComponent } from './components/page-router-link/page-router-link.component';
import { TabsPanelRendererComponent } from './plugins/style/tabs-panel-renderer/tabs-panel-renderer.component';
import { PropertiesDialogComponent } from './components/properties-dialog/properties-dialog.component';
import { CatchAllRouterComponent } from './components/catch-all-router/catch-all-router.component';
import { CatchAllGuard } from './guards/catchall.guard';
import { PageContextResolver } from './contexts/page-context.resolver';
import { ContextDialogComponent } from './components/context-dialog/context-dialog.component';
import { ContextEditorComponent } from './components/context-editor/context-editor.component';
import { RestContextResolver } from './contexts/rest-context.resolver';
import { FormContextResolver } from './contexts/form-context.resolver';
import { PanelPropsDialogComponent } from './components/panel-props-dialog/panel-props-dialog.component';
import { PanePropsDialogComponent } from './components/pane-props-dialog/pane-props-dialog.component';
import { PluginConfigurationManager, PluginConfig } from '@rollthecloudinc/plugin';
import { LayoutEditorHostDirective } from './directives/layout-editor-host.directive';
import { TablePanelRendererComponent } from './plugins/style/table-panel-renderer/table-panel-renderer.component';
import { TabsPanelEditorComponent } from './plugins/style/tabs-panel-editor/tabs-panel-editor.component';
import { PageStateEditorComponent } from './components/page-state-editor/page-state-editor.component';
import { PageStateFormComponent } from './components/page-state-form/page-state-form.component';
import { PanelsModule, PanelContentHandler, StylePlugin, StylePluginManager, STYLE_PLUGIN, PageBuilderFacade, FormService } from '@rollthecloudinc/panels';
import { TabsStyleHandler } from './handlers/style/tabs-style.handler';
import { PaneStateContextResolver } from './contexts/pane-state-context.resolver';
import { PageStateContextResolver } from './contexts/page-state-context.resolver';
import { ParamPluginManager, DparamModule, ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { BridgeBuilderPluginManager, BridgeModule } from '@rollthecloudinc/bridge';
import { CrudAdaptorPluginManager, CrudDataHelperService, CrudDataService } from '@rollthecloudinc/crud';
// import { PanelPageForm } from './models/form.models';
import { FormDatasourceFormComponent } from './components/form-datasource-form/form-datasource-form.component';
import { FormDatasourceComponent } from './components/form-datasource/form-datasource.component';
import { DatasourceModule, DatasourcePluginManager } from '@rollthecloudinc/datasource';
import { RenderModule } from '@rollthecloudinc/render';
import { PaneContentHostDirective } from './directives/pane-content-host.directive';
// import { PanelpageModule } from 'panelpage';
// import { EditablepaneModule } from 'editablepane';
// import { FlexLayoutServerModule } from '@angular/flex-layout/server';

const panePageMatcher = (url: UrlSegment[]) => {
  if(url[0] !== undefined && url[0].path === 'panelpage') {
    return {
      consumed: url,
      posParams: url.reduce<{}>((p, c, index) => {
        if(index === 1) {
          return { ...p, panelPageId: new UrlSegment(c.path, {}) }
        } else if(index > 1) {
          return { ...p, [`arg${index - 2}`]: new UrlSegment(c.path, {}) };
        } else {
          return { ...p };
        }
      }, {})
    };
  } else {
    return null;
  }
}

const routes = [
  { path: 'pages', children: [
    { path: 'create-panel-page', component: CreatePanelPageComponent },
    { path: 'panelpage/:panelPageId/manage', component: EditPanelPageComponent },
    //{ matcher: panePageMatcher, component: PanelPageRouterComponent },
  ]},
  //{ path: '**', component: CatchAllRouterComponent, canActivate: [ CatchAllGuard ] }
];

@NgModule({
  imports: [
    CommonModule,
    // HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    // FlexLayoutServerModule,
    AngularSplitModule,
    RouterModule.forChild(routes),
    NgxJsonViewerModule,
    MarkdownModule.forChild(),
    NgxDropzoneModule,
    GridsterModule,
    UtilsModule,
    TokenModule,
    ContextModule,
    AttributesModule,
    MediaModule,
    LayoutModule,
    // NgxGalleryModule,
    NgxAngularQueryBuilderModule,
    // TaxonomyModule,
    // StoreModule.forFeature(fromPageBuilder.pageBuilderFeatureKey, fromPageBuilder.reducer),
    // EffectsModule.forFeature([PageBuilderEffects]),
    PanelsModule,
    RestModule,
    SnippetModule,
    DparamModule,
    BridgeModule,
    DatasourceModule,
    RenderModule,
    // PanelpageModule,
    // EditablepaneModule
  ],
  declarations: [ContentSelectorComponent, ContentSelectionHostDirective, SnippetPaneRendererComponent, ContentEditorComponent, SnippetEditorComponent, PanelPageRouterComponent, CreatePanelPageComponent, EditPanelPageComponent, AttributeSelectorComponent, AttributeEditorComponent, AttributePaneRendererComponent, MediaEditorComponent, MediaPaneRendererComponent, RenderingEditorComponent, /*PanelSelectorComponent,*/ /*PanelEditorComponent,*/ StyleSelectorComponent, GalleryEditorComponent, /*GalleryPanelRendererComponent,*/ DatasourceSelectorComponent, RestEditorComponent, RestFormComponent, RestPaneRendererComponent, VirtualListPanelRendererComponent, SliceEditorComponent, SliceFormComponent, SelectionComponent, RulesDialogComponent, TabsPanelRendererComponent, PropertiesDialogComponent, CatchAllRouterComponent, ContextDialogComponent, ContextEditorComponent, PanelPropsDialogComponent, PanePropsDialogComponent, LayoutEditorHostDirective, TablePanelRendererComponent, TabsPanelEditorComponent, PageStateEditorComponent, PageStateFormComponent, FormDatasourceFormComponent, FormDatasourceComponent, PaneContentHostDirective, EditablePaneComponent],
  providers: [
    CatchAllGuard,
    PageContextResolver,
    RestContextResolver,
    FormContextResolver,
    PaneStateContextResolver,
    PageStateContextResolver,
    { provide: EMBEDDABLE_COMPONENT, useValue: PageRouterLinkComponent, multi: true },
    { provide: EMBEDDABLE_COMPONENT, useValue: MarkdownComponent, multi: true },
    { provide: EMBEDDABLE_COMPONENT, useValue: PanelPageRouterComponent, multi: true},
    { provide: SnippetContentHandler, useClass: SnippetContentHandler },
    { provide: AttributeContentHandler, useClass: AttributeContentHandler },
    { provide: MediaContentHandler, useClass: MediaContentHandler },
    /*{ provide: PanelContentHandler, useClass: PanelContentHandler },*/
    { provide: RestContentHandler, useClass: RestContentHandler },
    { provide: SliceContentHandler, useClass:  SliceContentHandler },
    { provide: TabsStyleHandler, useClass: TabsStyleHandler },
    //{ provide: CONTEXT_PLUGIN, useFactory: pageContextFactory, multi: true, deps: [ PageContextResolver ] },
    { provide: CONTENT_PLUGIN, useFactory: snippetContentPluginFactory, multi: true, deps: [ SnippetContentHandler ] },
    { provide: CONTENT_PLUGIN, useFactory: attributeContentPluginFactory, multi: true, deps: [ AttributeContentHandler ] },
    { provide: CONTENT_PLUGIN, useFactory: mediaContentPluginFactory, multi: true, deps: [ MediaContentHandler ] },
    // { provide: CONTENT_PLUGIN, useFactory: panelContentPluginFactory, multi: true, deps: [ PanelContentHandler ] }, -> moved to panels module
    { provide: CONTENT_PLUGIN, useFactory: restContentPluginFactory, multi: true, deps: [ RestContentHandler ]  },
    { provide: CONTENT_PLUGIN, useFactory: sliceContentPluginFactory, multi: true, deps: [ SliceContentHandler ]  },
    // { provide: STYLE_PLUGIN, useValue: new StylePlugin<string>({ id: 'gallery', name: 'gallery', title: 'Gallery', editorComponent: undefined, renderComponent: GalleryPanelRendererComponent }), multi: true },
    { provide: STYLE_PLUGIN, useValue: new StylePlugin<string>({ id: 'virtuallist', name: 'virtuallist', title: 'Virtual List', editorComponent: undefined, renderComponent: VirtualListPanelRendererComponent }), multi: true },
    { provide: STYLE_PLUGIN, useFactory: tabsStylePluginFactory, multi: true, deps: [ TabsStyleHandler ] },
    { provide: STYLE_PLUGIN, useValue: new StylePlugin<string>({ id: 'table', name: 'table', title: 'Table', editorComponent: undefined, renderComponent: TablePanelRendererComponent }), multi: true }
  ],
  exports: [
    PanelPageRouterComponent,
    CatchAllRouterComponent,
    EditPanelPageComponent
  ]
})
export class PagesModule {
  constructor(
    @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin<string>>,
    @Inject(STYLE_PLUGIN) stylePlugins: Array<StylePlugin<string>>,
    cpm: ContentPluginManager,
    cxm: ContextPluginManager,
    spm: StylePluginManager,
    eds: EntityDefinitionService,
    ppm: ParamPluginManager,
    rcm: ResolvedContextPluginManager,
    pluginConfigurationManager: PluginConfigurationManager,
    contextManager: ContextManagerService,
    tokenizerService: TokenizerService,
    formService: FormService,
    pageBuilderFacade: PageBuilderFacade,
    pageContextResolver: PageContextResolver,
    restContextResolver: RestContextResolver,
    formContextResolver: FormContextResolver,
    paneStateContextResolver: PaneStateContextResolver,
    pageStateContextResolver: PageStateContextResolver,
    bpm: BridgeBuilderPluginManager,
    http: HttpClient,
    pluralizer: Pluralizer,
    dataServiceConfig: DefaultDataServiceConfig,
    crud: CrudAdaptorPluginManager,
    entityDefinitionService: EntityDefinitionService,
    entityDataService: EntityDataService,
    paramEvaluatorService: ParamEvaluatorService,
    dpm: DatasourcePluginManager,
    attributeSerializer: AttributeSerializerService,
    crudDataHelper: CrudDataHelperService
  ) {
    eds.registerMetadataMap(entityMetadata);

    const contextPlugins = [pageContextFactory(pageContextResolver), restContextFactory(restContextResolver), formContextFactory(formContextResolver), paneStateContextFactory(paneStateContextResolver), pageStateContextFactory(pageStateContextResolver)];

    /*contextManager.register(pageContextFactory(pageContextResolver));
    contextManager.register(restContextFactory(restContextResolver));
    contextManager.register(formContextFactory(formContextResolver));*/

    contextPlugins.forEach(p => {
      // contextManager.register(p); // This will eventually go away once code uses plugin manager instead.
      cxm.register(p);
    });

    // Remove this since much easier just to leave as is for now.
    // Proof of concept - snippet is not really worth decoupling.
    /*pluginConfigurationManager.addConfig(new PluginConfig({
      modules: [
        { module: () => import('./plugins/snippet/snippet.module').then(m => m.SnippetModule), plugins: new Map<string, Array<string>>([ ['content', [ 'snippet' ]] ]) }
      ]
    }));*/

    contentPlugins.forEach(p => cpm.register(p));
    stylePlugins.forEach(p => spm.register(p));

    ppm.register(formParamPluginFactory(
      tokenizerService,
      formService,
      pageBuilderFacade
    ));

    rcm.register(formResolvedContextPluginFactory(pageBuilderFacade));

    bpm.register(pagesFormBridgeFactory(formService));

    // build because this is after the built phase since module is lazy loaded.
    // There is probably a better solution but for now this will work.
    // Probably is better to schedule builds using a queue to automatically add.
    // It doesn't really do any harm calling build though since prototype will just overriden and shouldn't have state anyway.
    bpm.getPlugin('pages_form').subscribe(p => p.build());

    // Experimental - form testing
    //entityDataService.registerService('PanelPageForm', new CrudDataService<PanelPageForm>('PanelPageForm', crud, entityDefinitionService, crudDataHelper));

    crud.register(formSerializationEntityCrudAdaptorPluginFactory(paramEvaluatorService, formService));

    dpm.register(formDatasourcePluginFactory(attributeSerializer, pageBuilderFacade, formService));
  }
}
