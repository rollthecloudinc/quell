import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, UrlSegment, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MarkdownModule, MarkdownComponent } from 'ngx-markdown';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularSplitModule } from 'angular-split';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MaterialModule } from 'material';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { QueryBuilderModule } from 'angular2-query-builder';
import { MediaModule } from 'media';
import { UtilsModule, EMBEDDABLE_COMPONENT  } from 'utils';
import { TokenModule } from 'token';
import { AttributesModule } from 'attributes';
import { CONTENT_PLUGIN } from 'content';
import { CONTEXT_PLUGIN, ContextManagerService, ContextModule } from 'context';
// import { TaxonomyModule } from 'taxonomy';
import { STYLE_PLUGIN, StylePlugin } from 'style';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { GridsterModule } from 'angular-gridster2';
import { EntityDefinitionService } from '@ngrx/data';
import { HttpClientModule } from '@angular/common/http';
import { entityMetadata } from './entity-metadata';
import { GridLayoutComponent } from './components/grid-layout/grid-layout.component';
import { CreateGridLayoutComponent } from './components/create-grid-layout/create-grid-layout.component';
import { ContentSelectorComponent } from './components/content-selector/content-selector.component';
import { ContentSelectionHostDirective } from './directives/content-selection-host.directive';
import { PaneContentHostDirective } from './directives/pane-content-host.directive';
import { StoreModule } from '@ngrx/store';
import * as fromPageBuilder from './features/page-builder/page-builder.reducer';
import { EffectsModule } from '@ngrx/effects';
import { PageBuilderEffects } from './features/page-builder/page-builder.effects';
import { EditablePaneComponent } from './components/editable-pane/editable-pane.component';
import { SnippetFormComponent } from './components/snippet-form/snippet-form.component';
import { SnippetPaneRendererComponent } from './plugins/snippet/snippet-pane-renderer/snippet-pane-renderer.component';
import { PageBuilderComponent } from './components/page-builder/page-builder.component';
import { ContentEditorComponent } from './components/content-editor/content-editor.component';
import { SnippetEditorComponent } from './plugins/snippet/snippet-editor/snippet-editor.component';
import { GridLayoutFormComponent } from './components/grid-layout-form/grid-layout-form.component';
import { GridLayoutMasterComponent } from './components/grid-layout-master/grid-layout-master.component';
import { PanelPageComponent } from './components/panel-page/panel-page.component';
import { RenderPaneComponent } from './components/render-pane/render-pane.component';
import { PanelPageRouterComponent } from './components/panel-page-router/panel-page-router.component';
import { CreatePanelPageComponent } from './components/create-panel-page/create-panel-page.component';
import { EditPanelPageComponent } from './components/edit-panel-page/edit-panel-page.component';
import { SnippetContentHandler } from './handlers/snippet-content.handler';
import { snippetContentPluginFactory, attributeContentPluginFactory, mediaContentPluginFactory, panelContentPluginFactory, restContentPluginFactory, sliceContentPluginFactory, pageContextFactory, restContextFactory, formContextFactory } from './pages.factories';
import { AttributeSelectorComponent } from './plugins/attribute/attribute-selector/attribute-selector.component';
import { AttributeContentHandler } from './handlers/attribute-content.handler';
import { AttributeEditorComponent } from './plugins/attribute/attribute-editor/attribute-editor.component';
import { AttributePaneRendererComponent } from './plugins/attribute/attribute-pane-renderer/attribute-pane-renderer.component';
import { MediaContentHandler } from './handlers/media-content.handler';
import { PanelContentHandler } from './handlers/panel-content.handler';
import { MediaEditorComponent } from './plugins/media/media-editor/media-editor.component';
import { MediaPaneRendererComponent } from './plugins/media/media-pane-renderer/media-pane-renderer.component';
import { RenderingEditorComponent } from './components/rendering-editor/rendering-editor.component';
import { PanelSelectorComponent } from './plugins/panel/panel-selector/panel-selector.component';
import { PanelEditorComponent } from './plugins/panel/panel-editor/panel-editor.component';
import { StyleSelectorComponent } from './components/style-selector/style-selector.component';
import { GalleryEditorComponent } from './plugins/style/gallery-editor/gallery-editor.component';
import { GalleryPanelRendererComponent } from './plugins/style/gallery-panel-renderer/gallery-panel-renderer.component';
import { RenderPanelComponent } from './components/render-panel/render-panel.component';
import { DatasourceSelectorComponent } from './plugins/datasource/datasource-selector/datasource-selector.component';
import { RestEditorComponent } from './plugins/rest/rest-editor/rest-editor.component';
import { RestFormComponent } from './components/rest-form/rest-form.component';
import { RestContentHandler } from './handlers/rest-content-handler.service';
import { RestPaneRendererComponent } from './plugins/rest/rest-pane-renderer/rest-pane-renderer.component';
import { VirtualListPanelRendererComponent } from './plugins/style/virtual-list-panel-renderer/virtual-list-panel-renderer.component';
import { SliceContentHandler } from './handlers/slice-content.handler';
import { SliceEditorComponent } from './plugins/slice/slice-editor/slice-editor.component';
import { SliceFormComponent } from './components/slice-form/slice-form.component';
import { GridlessLayoutComponent } from './components/gridless-layout/gridless-layout.component';
import { RestSourceFormComponent } from './components/rest-source-form/rest-source-form.component';
import { SelectionComponent } from './components/selection/selection.component';
import { RulesDialogComponent } from './components/rules-dialog/rules-dialog.component';
import { PageRouterLinkComponent } from './components/page-router-link/page-router-link.component';
import { SplitLayoutComponent } from './components/split-layout/split-layout.component';
import { FlexLayoutComponent } from './components/flex-layout/flex-layout.component';
import { TabsPanelRendererComponent } from './plugins/style/tabs-panel-renderer/tabs-panel-renderer.component';
import { PropertiesDialogComponent } from './components/properties-dialog/properties-dialog.component';
import { CatchAllRouterComponent } from './components/catch-all-router/catch-all-router.component';
import { CatchAllGuard } from './guards/catchall.guard';
import { PageContextResolver } from './contexts/page-context.resolver';
import { ContextDialogComponent } from './components/context-dialog/context-dialog.component';
import { ContextEditorComponent } from './components/context-editor/context-editor.component';
import { RestContextResolver } from './contexts/rest-context.resolver';
import { FormContextResolver } from './contexts/form-context.resolver';
import { PanelResolverService } from './services/panel-resolver.service';
import { PanelPropsDialogComponent } from './components/panel-props-dialog/panel-props-dialog.component';
import { PluginConfigurationManager, PluginConfig } from 'plugin';

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
    { path: 'create-grid-layout', component: CreateGridLayoutComponent },
    { path: 'create-panel-page', component: CreatePanelPageComponent },
    { path: 'page-builder', component: PageBuilderComponent },
    { path: 'grid-layouts', component: GridLayoutMasterComponent },
    { matcher: panePageMatcher, component: PanelPageRouterComponent },
    { path: 'panelpage/:panelPageId/manage', component: EditPanelPageComponent },
  ]},
  //{ matcher: testPageMatcher, component: PanelPageRouterComponent },
  { path: '**', component: CatchAllRouterComponent, canActivate: [ CatchAllGuard ] }
  // { path: '**', component: PageControllerComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
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
    NgxGalleryModule,
    QueryBuilderModule,
    // TaxonomyModule,
    StoreModule.forFeature(fromPageBuilder.pageBuilderFeatureKey, fromPageBuilder.reducer),
    EffectsModule.forFeature([PageBuilderEffects])
  ],
  declarations: [GridLayoutComponent, CreateGridLayoutComponent, ContentSelectorComponent, ContentSelectionHostDirective, PaneContentHostDirective, EditablePaneComponent, SnippetFormComponent, SnippetPaneRendererComponent, PageBuilderComponent, ContentEditorComponent, SnippetEditorComponent, GridLayoutFormComponent, GridLayoutMasterComponent, PanelPageComponent, RenderPanelComponent, RenderPaneComponent, PanelPageRouterComponent, CreatePanelPageComponent, EditPanelPageComponent, AttributeSelectorComponent, AttributeEditorComponent, AttributePaneRendererComponent, MediaEditorComponent, MediaPaneRendererComponent, RenderingEditorComponent, PanelSelectorComponent, PanelEditorComponent, StyleSelectorComponent, GalleryEditorComponent, GalleryPanelRendererComponent, DatasourceSelectorComponent, RestEditorComponent, RestFormComponent, RestPaneRendererComponent, VirtualListPanelRendererComponent, SliceEditorComponent, SliceFormComponent, GridlessLayoutComponent, RestSourceFormComponent, SelectionComponent, RulesDialogComponent, SplitLayoutComponent, FlexLayoutComponent, TabsPanelRendererComponent, PropertiesDialogComponent, CatchAllRouterComponent, ContextDialogComponent, ContextEditorComponent, PanelPropsDialogComponent],
  providers: [
    CatchAllGuard,
    PageContextResolver,
    RestContextResolver,
    FormContextResolver,
    PanelResolverService,
    { provide: EMBEDDABLE_COMPONENT, useValue: PageRouterLinkComponent, multi: true },
    { provide: EMBEDDABLE_COMPONENT, useValue: MarkdownComponent, multi: true },
    { provide: EMBEDDABLE_COMPONENT, useValue: PanelPageComponent, multi: true },
    { provide: SnippetContentHandler, useClass: SnippetContentHandler },
    { provide: AttributeContentHandler, useClass: AttributeContentHandler },
    { provide: MediaContentHandler, useClass: MediaContentHandler },
    { provide: PanelContentHandler, useClass: PanelContentHandler },
    { provide: RestContentHandler, useClass: RestContentHandler },
    { provide: SliceContentHandler, useClass:  SliceContentHandler },
    //{ provide: CONTEXT_PLUGIN, useFactory: pageContextFactory, multi: true, deps: [ PageContextResolver ] },
    { provide: CONTENT_PLUGIN, useFactory: snippetContentPluginFactory, multi: true, deps: [ SnippetContentHandler ] },
    { provide: CONTENT_PLUGIN, useFactory: attributeContentPluginFactory, multi: true, deps: [ AttributeContentHandler ] },
    { provide: CONTENT_PLUGIN, useFactory: mediaContentPluginFactory, multi: true, deps: [ MediaContentHandler ] },
    { provide: CONTENT_PLUGIN, useFactory: panelContentPluginFactory, multi: true, deps: [ PanelContentHandler ] },
    { provide: CONTENT_PLUGIN, useFactory: restContentPluginFactory, multi: true, deps: [ RestContentHandler ]  },
    { provide: CONTENT_PLUGIN, useFactory: sliceContentPluginFactory, multi: true, deps: [ SliceContentHandler ]  },
    { provide: STYLE_PLUGIN, useValue: new StylePlugin({ name: 'gallery', title: 'Gallery', editorComponent: undefined, renderComponent: GalleryPanelRendererComponent }), multi: true },
    { provide: STYLE_PLUGIN, useValue: new StylePlugin({ name: 'virtuallist', title: 'Virtual List', editorComponent: undefined, renderComponent: VirtualListPanelRendererComponent }), multi: true },
    { provide: STYLE_PLUGIN, useValue: new StylePlugin({ name: 'tabs', title: 'Tabs', editorComponent: undefined, renderComponent: TabsPanelRendererComponent }), multi: true }
  ],
  //exports: [NavigationHostDirective]
})
export class PagesModule {
  constructor(
    eds: EntityDefinitionService,
    pluginConfigurationManager: PluginConfigurationManager,
    contextManager: ContextManagerService,
    pageContextResolver: PageContextResolver,
    restContextResolver: RestContextResolver,
    formContextResolver: FormContextResolver
  ) {
    eds.registerMetadataMap(entityMetadata);
    contextManager.register(pageContextFactory(pageContextResolver));
    contextManager.register(restContextFactory(restContextResolver));
    contextManager.register(formContextFactory(formContextResolver));

    pluginConfigurationManager.addConfig(new PluginConfig({
      modules: [
        { module: 'modules/pages/src/lib/pages.module', plugins: new Map<string, Array<string>>([ ['content', [ 'snippet' ]] ]) }
      ]
    }));

  }
}
