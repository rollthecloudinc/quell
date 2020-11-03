import { Injectable } from '@angular/core';
import { BasePluginManager, PluginManager } from 'plugin';
import { ContentPlugin } from '../models/content.models';
import { ContentPluginDef } from './content-plugin-def.service';

@Injectable({
  providedIn: 'root'
})
export class ContentPluginManager extends BasePluginManager<ContentPlugin> implements PluginManager<ContentPlugin> {
  constructor(pluginDef: ContentPluginDef) {
    super(pluginDef);
  }
}
