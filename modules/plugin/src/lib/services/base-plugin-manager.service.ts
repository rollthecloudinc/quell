// import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
// import { PluginDef} from '../models/plugin.models';
import { ModuleLoaderService } from '@ng-druid/utils';
import { ConfigDiscovery } from './config-discovery.service';
import { PluginConfigurationManager } from './plugin-configuration-manager.service';
import { PluginDef, Plugin, PluginDiscovery } from '../models/plugin.models';

// @Injectable()
export abstract class BasePluginManager<T extends Plugin<Y>, Y> {
  protected pluginInstances = new Map<Y, T>();
  private discoveryPipeline: Array<PluginDiscovery> = [];
  constructor(private pcm: PluginConfigurationManager, private moduleLoader: ModuleLoaderService) {
    this.discovery();
  }
  abstract pluginDef(): Observable<PluginDef>;
  discovery() {
    this.discoveryPipeline.push(new ConfigDiscovery(this.pcm, this.moduleLoader));
  }
  register(plugin: T): void {
    this.pluginInstances.set(plugin.id, plugin);
  }
  getPlugins(ids?: Array<Y>): Observable<Map<Y, T>> {
    const newPlugins = ids ? ids.filter(id => !this.pluginInstances.has(id)) : [];
    if (ids && newPlugins.length === 0) {
      return of(new Map<Y, T>(ids.map(id => [id, this.pluginInstances.get(id)])));
    } else {
      return this.pluginDef().pipe(
        switchMap(def => forkJoin(this.discoveryPipeline.map(d => d.loadPlugins(def, newPlugins))).pipe(
          map(() => ids ? new Map<Y, T>(ids.map(id => [id, this.pluginInstances.get(id)])) : this.pluginInstances )
        ))
      );
    }
  }
  getPlugin(id: Y): Observable<T> {
    if (this.pluginInstances.has(id)) {
      return of(this.pluginInstances.get(id));
    } else {
      return this.pluginDef().pipe(
        switchMap(def => forkJoin(this.discoveryPipeline.map(d => d.loadPlugins(def, [id]))).pipe(
          map(() => this.pluginInstances.get(id))
        ))
      );
    }
  }
}
