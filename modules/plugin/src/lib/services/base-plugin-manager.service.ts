// import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { PluginDef} from '../models/plugin.models';
import { PluginLoader } from './plugin-loader.service';

// @Injectable()
export class BasePluginManager<T> {
  private pluginInstances: Array<T> = [];
  constructor(private pluginLoader: PluginLoader) {
  }
  register(plugin: T): void {
    this.pluginInstances.push(plugin);
  }
  getPlugins(): Observable<Array<T>> {
    return this.pluginLoader.loadPlugins().pipe(
      map(() => this.pluginInstances)
    );
  }
}
