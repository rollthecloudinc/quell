import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { InteractionActionPlugin } from '../models/interaction-action.models';

@Injectable({
  providedIn: 'root'
})
export class InteractionActionPluginManager extends BasePluginManager<InteractionActionPlugin<string>, string> implements PluginManager<InteractionActionPlugin<string>, string> {
  constructor(
    pcm: PluginConfigurationManager, 
    moduleLoader: ModuleLoaderService
  ) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'interaction_action' }));
  }
  discovery(): void {
      super.discovery()
  }
}