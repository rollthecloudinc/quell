import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@ng-druid/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@ng-druid/plugin';
import { ContentPlugin } from '../models/content.models';

@Injectable({
  providedIn: 'root'
})
export class ContentPluginManager extends BasePluginManager<ContentPlugin<string>, string> implements PluginManager<ContentPlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'content' }));
  }
}
