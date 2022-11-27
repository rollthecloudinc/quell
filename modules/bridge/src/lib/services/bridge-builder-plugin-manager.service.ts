import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/moduleloader';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { BridgeBuilderPlugin } from '../models/bridge-builder.models';

@Injectable({
  providedIn: 'root'
})
export class BridgeBuilderPluginManager extends BasePluginManager<BridgeBuilderPlugin<string>, string> implements PluginManager<BridgeBuilderPlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'bridgebuilder' }));
  }
}
