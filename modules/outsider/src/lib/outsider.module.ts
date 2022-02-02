import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ContentPluginManager } from 'content';
import { MaterialModule } from 'material';
import { OutsideAppEditorComponent } from './components/outside-app-editor/outside-app-editor.component';
import { OutsideAppRendererComponent } from './components/outside-app-renderer/outside-app-renderer.component';
import { OutsideAppContentHandler } from './handlers/outside-app-content.handler';
import { outsideAppPluginFactory } from './outsider.factories';
@NgModule({
  declarations: [
    OutsideAppEditorComponent,
    OutsideAppRendererComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  exports: [
    OutsideAppEditorComponent,
    OutsideAppRendererComponent
  ]
})
export class OutsiderModule { 
  constructor(
    cpm: ContentPluginManager,
    handler: OutsideAppContentHandler
  ) {
    cpm.register(outsideAppPluginFactory({ handler }));
  }
}
