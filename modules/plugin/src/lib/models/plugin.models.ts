import { Type } from '@angular/core';
import { Observable, of } from 'rxjs';

// export interface Plugin {}

export interface PluginManager<T> {
  register(plugin: T): void;
  getDef(): PluginDef<T>;
  getPlugins(): Observable<Array<T>>;
}

export interface PluginDef<T> {
  getPlugins(): Observable<boolean>;
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

export class PluginConfigModule {
  module: () => Promise<Type<any>>;
  plugins: Map<string, Array<string>>;
  constructor(data?: PluginConfigModule) {
    if (data) {
      this.module = data.module;
      if (data.plugins) {
        this.plugins = new Map<string, Array<string>>([ ...data.plugins ]);
      }
    }
  }
}

/*export class BasePlugin implements Plugin {
}*/

