import { Type } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PluginManager<T extends Plugin<Y>, Y> {
  discovery(): void;
  pluginDef(): Observable<PluginDef>;
  register(plugin: T): void;
  // getDef(): PluginDef<T>;
  getPlugins(names?: Array<Y>): Observable<Map<Y, T>>;
  getPlugin(name: Y): Observable<T>;
}

/*export interface PluginDef<T> {
  getPlugins(): Observable<boolean>;
}*/

export interface PluginDiscovery {
  loadPlugins(pluginDef: PluginDef, ids: Array<any>): Observable<boolean>;
}

export class PluginConfig {
  modules: Array<PluginConfigModule>  = [];
  constructor(data?: PluginConfig) {
    if (data) {
      if (data.modules) {
        this.modules = data.modules.map(m => new PluginConfigModule(m));
      }
    }
  }
}

export class Plugin<T> {
  id: T;
  title: string;
  constructor(data?: Plugin<T>) {
    if (data) {
      this.id = data.id;
      this.title = data.title;
    }
  }
}

export class PluginDef {
  name: string;
  constructor(data?: PluginDef) {
    if (data) {
      this.name = data.name;
    }
  }
}

export class PluginConfigModule {
  module: () => Promise<Type<any>>;
  plugins: Map<string, Array<any>>;
  constructor(data?: PluginConfigModule) {
    if (data) {
      this.module = data.module;
      if (data.plugins) {
        this.plugins = new Map<string, Array<any>>([ ...data.plugins ]);
      }
    }
  }
}

/*export class BasePlugin implements Plugin {
}*/

