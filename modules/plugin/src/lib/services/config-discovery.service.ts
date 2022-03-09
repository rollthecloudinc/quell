import { Type, Compiler, Injector, Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModuleLoaderService } from '@ng-druid/utils';
// import { PluginDef } from '../models/plugin.models';
import { PluginConfigurationManager } from './plugin-configuration-manager.service';
import { PluginDef, PluginDiscovery } from '../models/plugin.models';

@Injectable({
  providedIn: 'root'
})
export class ConfigDiscovery implements PluginDiscovery  {
  constructor(private pcm: PluginConfigurationManager, private moduleLoader: ModuleLoaderService) {
  }
  loadPlugins(pluginDef: PluginDef, ids: Array<any> = []): Observable<boolean> {
    const configs = this.pcm.getConfigs();
    const len = configs.length;
    const loadModules$: Array<Observable<boolean>> = [];
    for(let i = 0; i < len; i++) {
      const len2 = configs[i].modules.length;
      for(let j = 0; j < len2; j++) {
        if(configs[i].modules[j].plugins.has(pluginDef.name) &&
          (
            ids.length === 0 ||
            ids.some(id => configs[i].modules[j].plugins.get(pluginDef.name).findIndex(p => p === id) > -1)
          )
        ) {
          loadModules$.push(this.moduleLoader.loadModule(configs[i].modules[j].module));
        }
      }
    }
    if (loadModules$.length === 0) {
      return of(true);
    } else {
      return forkJoin(loadModules$).pipe(
        map(() => true)
      );
    }
  }
}
