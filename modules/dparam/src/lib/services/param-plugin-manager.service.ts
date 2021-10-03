import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from 'utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from 'plugin';
import { ParamPlugin } from '../models/param-plugin.models';

@Injectable({
  providedIn: 'root'
})
export class ParamPluginManager extends BasePluginManager<ParamPlugin<string>, string> implements PluginManager<ParamPlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'param' }));
  }
}
