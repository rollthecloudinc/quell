// import { Injectable } from '@angular/core';
import { PluginDef} from '../models/plugin.models';

// @Injectable()
export class BasePluginManager<T> {
  private pluginInstances: Array<T> = [];
  constructor(private pluginDef: PluginDef<T>) {
  }
  register(plugin: T): void {
    this.pluginInstances.push(plugin);
  }
  getDef(): PluginDef<T> {
    return this.pluginDef;
  }
  getPlugins(): Array<T> {
    this.pluginDef.getPlugins();
    return this.pluginInstances;
  }
}
