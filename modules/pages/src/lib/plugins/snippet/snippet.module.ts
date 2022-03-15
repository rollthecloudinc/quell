import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ContentPlugin, ContentPluginManager } from '@ng-druid/content';
import { MarkdownModule } from 'ngx-markdown';
import { AngularSplitModule } from 'angular-split';
import { MaterialModule } from '@ng-druid/material';
import { UtilsModule  } from '@ng-druid/utils';
import { SnippetEditor2Component } from './snippet-editor2/snippet-editor2.component';
import { SnippetPaneRenderer2Component } from './snippet-pane-renderer2/snippet-pane-renderer2.component';
import { SnippetForm2Component } from './snippet-form2/snippet-form2.component';
import { SnippetContentHandler } from './snippet-content.handler';

export const snippetContentPluginFactory = (handler: SnippetContentHandler) => {
  return new ContentPlugin<string>({
    id: 'snippet',
    title: 'Snippet',
    selectionComponent: undefined,
    editorComponent: SnippetEditor2Component,
    renderComponent: SnippetPaneRenderer2Component,
    handler
  })
}

@NgModule({
  imports: [ CommonModule, ReactiveFormsModule, FormsModule, AngularSplitModule, MarkdownModule.forChild(), MaterialModule, UtilsModule ],
  declarations: [ SnippetEditor2Component, SnippetPaneRenderer2Component, SnippetForm2Component ],
  // exports: [ SnippetEditor2Component, SnippetPaneRenderer2Component, SnippetForm2Component ],
  providers: [
    { provide: SnippetContentHandler, useClass: SnippetContentHandler }
  ]
})
export class SnippetModule {
  constructor(contentPluginManager: ContentPluginManager, snipperHandler: SnippetContentHandler) {
    contentPluginManager.register(snippetContentPluginFactory(snipperHandler));
  }
}
