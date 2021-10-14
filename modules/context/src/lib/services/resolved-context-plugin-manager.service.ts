import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from 'utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from 'plugin';
import { ContextPlugin } from '../models/context.models';

@Injectable({
  providedIn: 'root'
})
export class ResolvedContextPluginManager extends BasePluginManager<ContextPlugin<string>, string> implements PluginManager<ContextPlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'resolved_context' }));
  }
}
