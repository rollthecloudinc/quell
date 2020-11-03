import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentPlugin, ContentPluginManager } from 'content';
import { SnippetEditorComponent } from './snippet-editor/snippet-editor.component';
import { SnippetPaneRendererComponent } from './snippet-pane-renderer/snippet-pane-renderer.component';
import { SnippetContentHandler } from './snippet-content.handler';

export const snippetContentPluginFactory = (handler: SnippetContentHandler) => {
  return new ContentPlugin({
    name: 'snippet',
    title: 'Snippet',
    selectionComponent: undefined,
    editorComponent: SnippetEditorComponent,
    renderComponent: SnippetPaneRendererComponent,
    handler
  })
}

@NgModule({
  imports: [ CommonModule ],
  declarations: [ SnippetEditorComponent, SnippetPaneRendererComponent ],
  exports: [ SnippetEditorComponent, SnippetPaneRendererComponent ],
  providers: [
    { provide: SnippetContentHandler, useClass: SnippetContentHandler }
  ]
})
export class SnippetModule {
  constructor(contentPluginManager: ContentPluginManager, snipperHandler: SnippetContentHandler) {
    contentPluginManager.register(snippetContentPluginFactory(snipperHandler));
  }
}
