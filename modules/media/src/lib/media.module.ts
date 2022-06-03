import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentPluginManager } from '@rollthecloudinc/content';
import { MediafilePaneRendererComponent } from './components/mediafile-pane-renderer/mediafile-pane-renderer.component';
import { mediafileContentPluginFactory } from './media.factories';

@NgModule({
  declarations: [ MediafilePaneRendererComponent ],
  exports: [ MediafilePaneRendererComponent ],
  imports: [CommonModule /*, HttpClientModule*/]
})
export class MediaModule {
  constructor(
    cpm: ContentPluginManager
  ) {
    cpm.register(mediafileContentPluginFactory());
  }
}
