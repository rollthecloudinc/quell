// import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  getPlugins(): Observable<Array<T>> {
    return this.pluginDef.getPlugins().pipe(
      map(() => this.pluginInstances)
    );
  }
}
