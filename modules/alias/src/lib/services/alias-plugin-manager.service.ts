import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { AliasPlugin } from '../models/alias.models';

@Injectable({
  providedIn: 'root'
})
export class AliasPluginManager extends BasePluginManager<AliasPlugin<string>, string> implements PluginManager<AliasPlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'alias' }));
  }
}
