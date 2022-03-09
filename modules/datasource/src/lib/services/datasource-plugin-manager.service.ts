import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@ng-druid/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@ng-druid/plugin';
import { DatasourcePlugin } from '../models/datasource.models';

@Injectable({
  providedIn: 'root'
})
export class DatasourcePluginManager extends BasePluginManager<DatasourcePlugin<string>, string> implements PluginManager<DatasourcePlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'datasource' }));
  }
}
