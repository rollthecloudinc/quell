import { Injectable, Compiler, Injector } from '@angular/core';
import { BasePluginDef, PluginDef, PluginConfigurationManager } from 'plugin';
import { ContentPlugin } from '../models/content.models';

@Injectable({
  providedIn: 'root'
})
export class ContentPluginDef extends BasePluginDef<ContentPlugin> implements PluginDef<ContentPlugin> {
  constructor(pcm: PluginConfigurationManager, compiler: Compiler, injector: Injector) {
    super(pcm, compiler, injector);
  }
}
