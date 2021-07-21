import { PanelContentHandler } from './handlers/panel-content.handler';
import { PanelSelectorComponent } from './plugins/panel/panel-selector/panel-selector.component';
import { PanelEditorComponent } from './plugins/panel/panel-editor/panel-editor.component';
import { ContentPlugin } from 'content';

export const panelContentPluginFactory = (handler: PanelContentHandler) => {
  return new ContentPlugin<string>({
    id: 'panel',
    title: 'Panel',
    selectionComponent: PanelSelectorComponent,
    editorComponent: PanelEditorComponent,
    renderComponent: undefined,
    handler
  })
}
