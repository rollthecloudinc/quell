import { SnippetContentHandler } from './handlers/snippet-content.handler';
import { AttributeContentHandler } from './handlers/attribute-content.handler';
import { MediaContentHandler } from './handlers/media-content.handler';
// import { PanelContentHandler } from './handlers/panel-content.handler';
import { ContentPlugin } from 'content';
import { ContextPlugin } from 'context';
import { Dataset } from 'datasource';
import { PanelPageState, PanelState , PaneState } from 'panels';
import { AttributeValue } from 'attributes';
import { SnippetPaneRendererComponent } from './plugins/snippet/snippet-pane-renderer/snippet-pane-renderer.component';
import { SnippetEditorComponent } from './plugins/snippet/snippet-editor/snippet-editor.component';
import { AttributeSelectorComponent } from './plugins/attribute/attribute-selector/attribute-selector.component';
import { AttributeEditorComponent } from './plugins/attribute/attribute-editor/attribute-editor.component';
import { AttributePaneRendererComponent } from './plugins/attribute/attribute-pane-renderer/attribute-pane-renderer.component';
import { MediaEditorComponent } from './plugins/media/media-editor/media-editor.component';
import { MediaPaneRendererComponent } from './plugins/media/media-pane-renderer/media-pane-renderer.component';
// import { PanelSelectorComponent } from './plugins/panel/panel-selector/panel-selector.component';
// import { PanelEditorComponent } from './plugins/panel/panel-editor/panel-editor.component';
import { RestEditorComponent } from './plugins/rest/rest-editor/rest-editor.component';
import { RestContentHandler } from './handlers/rest-content-handler.service';
import { RestPaneRendererComponent } from './plugins/rest/rest-pane-renderer/rest-pane-renderer.component';
import { SliceContentHandler } from './handlers/slice-content.handler';
import { SliceEditorComponent } from './plugins/slice/slice-editor/slice-editor.component';
import { PageContextResolver } from './contexts/page-context.resolver';
import { ContextEditorComponent } from './components/context-editor/context-editor.component';
import { RestContextResolver } from './contexts/rest-context.resolver';
import { FormContextResolver } from './contexts/form-context.resolver';
import { StylePlugin } from 'style';
import { TabsPanelEditorComponent } from './plugins/style/tabs-panel-editor/tabs-panel-editor.component';
import { TabsPanelRendererComponent } from './plugins/style/tabs-panel-renderer/tabs-panel-renderer.component';
import { TabsStyleHandler } from './handlers/style/tabs-style.handler';
import { PaneStateContextResolver } from './contexts/pane-state-context.resolver';
import { PageStateContextResolver } from './contexts/page-state-context.resolver';
import { PageStateEditorComponent } from './components/page-state-editor/page-state-editor.component';

export const snippetContentPluginFactory = (handler: SnippetContentHandler) => {
  return new ContentPlugin<string>({
    id: 'snippet',
    title: 'Snippet',
    selectionComponent: undefined,
    editorComponent: SnippetEditorComponent,
    renderComponent: SnippetPaneRendererComponent,
    handler
  })
}

export const attributeContentPluginFactory = (handler: AttributeContentHandler) => {
  return new ContentPlugin<string>({
    id: 'attribute',
    title: 'Attribute',
    selectionComponent: AttributeSelectorComponent,
    editorComponent: AttributeEditorComponent,
    renderComponent: AttributePaneRendererComponent,
    handler
  })
}

export const mediaContentPluginFactory = (handler: MediaContentHandler) => {
  return new ContentPlugin<string>({
    id: 'media',
    title: 'Media',
    selectionComponent: undefined,
    editorComponent: MediaEditorComponent,
    renderComponent: MediaPaneRendererComponent,
    handler
  })
}

/*export const panelContentPluginFactory = (handler: PanelContentHandler) => {
  return new ContentPlugin<string>({
    id: 'panel',
    title: 'Panel',
    selectionComponent: PanelSelectorComponent,
    editorComponent: PanelEditorComponent,
    renderComponent: undefined,
    handler
  })
}*/

export const restContentPluginFactory = (handler: RestContentHandler) => {
  return new ContentPlugin<string>({
    id: 'rest',
    title: 'REST',
    selectionComponent: undefined,
    editorComponent: RestEditorComponent,
    renderComponent: RestPaneRendererComponent,
    handler
  })
}

export const sliceContentPluginFactory = (handler: SliceContentHandler) => {
  return new ContentPlugin<string>({
    id: 'slice',
    title: 'Slice',
    selectionComponent: undefined,
    editorComponent: SliceEditorComponent,
    renderComponent: undefined,
    handler
  })
}

export const pageContextFactory = (resolver: PageContextResolver) => {
  const baseObject = {
    path: '',
  };
  return new ContextPlugin<string>({ id: "page", name: 'page', title: 'Page', global: true, group: 'pages', baseObject, resolver });
};

export const restContextFactory = (resolver: RestContextResolver) => {
  const baseObject = {
    dataset: new Dataset(),
  };
  return new ContextPlugin<string>({ id: "rest", name: 'rest', title: 'Rest', baseObject, resolver, editorComponent: ContextEditorComponent });
};

export const formContextFactory = (resolver: FormContextResolver) => {
  const baseObject = {
    dataset: new Dataset(),
  };
  return new ContextPlugin<string>({ id: "form", name: 'form', title: 'Form', baseObject, resolver });
};

export const paneStateContextFactory = (resolver: PaneStateContextResolver) => {
  const baseObject = new PaneState({ state: new AttributeValue() });
  return new ContextPlugin<string>({ id: 'panestate', name: 'panestate', title: 'Pane State', baseObject, resolver });
};

export const pageStateContextFactory = (resolver: PageStateContextResolver) => {
  const baseObject = new PaneState({ state: new AttributeValue() });
  return new ContextPlugin<string>({ id: 'pagestate', name: 'pagestate', title: 'Page State', baseObject, resolver, editorComponent: PageStateEditorComponent });
};

export const tabsStylePluginFactory = (handler: TabsStyleHandler) => {
  return new StylePlugin<string>({ id: 'tabs', name: 'tabs', title: 'Tabs', handler, editorComponent: TabsPanelEditorComponent, renderComponent: TabsPanelRendererComponent }); 
};
