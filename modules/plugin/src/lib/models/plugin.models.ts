import { Observable, of } from 'rxjs';

// export interface Plugin {}

export interface PluginManager<T> {
  register(plugin: T): void;
  getDef(): PluginDef<T>;
  getPlugins(): Array<T>;
}

export interface PluginDef<T> {
  getPlugins(): Observable<Array<T>>;
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
  module: string;
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

