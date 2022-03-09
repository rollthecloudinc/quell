import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@ng-druid/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@ng-druid/plugin';
import { StylePlugin } from '../models/style.models';

@Injectable({
  providedIn: 'root'
})
export class StylePluginManager extends BasePluginManager<StylePlugin<string>, string> implements PluginManager<StylePlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'style' }));
  }
}
