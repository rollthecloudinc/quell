import { Injectable } from '@angular/core';
import { BasePluginManager, PluginManager, PluginLoader } from 'plugin';
import { ContentPlugin } from '../models/content.models';

@Injectable({
  providedIn: 'root'
})
export class ContentPluginManager extends BasePluginManager<ContentPlugin> implements PluginManager<ContentPlugin> {
  constructor(pluginLoader: PluginLoader) {
    super(pluginLoader);
  }
}
