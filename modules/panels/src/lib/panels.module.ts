import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';
import { EntityDefinitionService } from '@ngrx/data';
import { entityMetadata } from './entity-metadata';
import { PanelPageLinkedlistComponent } from './components/panelpage-linkedlist/panelpage-linkedlist.component';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { MaterialModule } from 'material';
import { ContentPlugin, ContentPluginManager, CONTENT_PLUGIN } from 'content';
import { panelContentPluginFactory } from './panels.factories';
import { PanelContentHandler } from './handlers/panel-content.handler';
import { PanelEditorComponent } from './plugins/panel/panel-editor/panel-editor.component';
import { PanelSelectorComponent } from './plugins/panel/panel-selector/panel-selector.component';

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
    cpm: ContentPluginManager
  ) {
    eds.registerMetadataMap(entityMetadata);
    contentPlugins.forEach(p => cpm.register(p));
  }
}
