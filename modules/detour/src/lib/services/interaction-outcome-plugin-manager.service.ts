import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { InteractionOutcomePlugin } from '../models/interaction-outcome.models';

@Injectable({
  providedIn: 'root'
})
export class ValidationPluginManager extends BasePluginManager<InteractionOutcomePlugin<string>, string> implements PluginManager<InteractionOutcomePlugin<string>, string> {
  constructor(
    pcm: PluginConfigurationManager, 
    moduleLoader: ModuleLoaderService
  ) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'interaction_outcome' }));
  }
  discovery(): void {
      super.discovery()
  }
}