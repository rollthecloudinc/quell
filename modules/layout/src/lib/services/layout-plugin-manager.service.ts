import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { LayoutPlugin } from '../models/layout.models';

@Injectable({
  providedIn: 'root'
})
export class LayoutPluginManager extends BasePluginManager<LayoutPlugin<string>, string> implements PluginManager<LayoutPlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'layout' }));
  }
}
