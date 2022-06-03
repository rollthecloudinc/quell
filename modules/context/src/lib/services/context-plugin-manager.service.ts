import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { ContextPlugin } from '../models/context.models';

@Injectable({
  providedIn: 'root'
})
export class ContextPluginManager extends BasePluginManager<ContextPlugin<string>, string> implements PluginManager<ContextPlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'context' }));
  }
}
