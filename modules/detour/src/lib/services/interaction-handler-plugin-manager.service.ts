import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { InteractionHandlerPlugin } from '../models/interaction-handler.models';

@Injectable({
  providedIn: 'root'
})
export class InteractionHandlerPluginManager extends BasePluginManager<InteractionHandlerPlugin<string>, string> implements PluginManager<InteractionHandlerPlugin<string>, string> {
  constructor(
    pcm: PluginConfigurationManager, 
    moduleLoader: ModuleLoaderService
  ) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'interaction_handler' }));
  }
  discovery(): void {
      super.discovery()
  }
}