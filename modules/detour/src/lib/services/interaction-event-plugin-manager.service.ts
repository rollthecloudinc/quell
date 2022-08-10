import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { InteractionEventPlugin } from '../models/interaction-event.models';

@Injectable({
  providedIn: 'root'
})
export class InteractionEventPluginManager extends BasePluginManager<InteractionEventPlugin<string>, string> implements PluginManager<InteractionEventPlugin<string>, string> {
  constructor(
    pcm: PluginConfigurationManager, 
    moduleLoader: ModuleLoaderService
  ) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'interaction_event' }));
  }
}