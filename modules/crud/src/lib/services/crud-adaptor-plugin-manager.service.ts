import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { CrudAdaptorPlugin } from '../models/crud.models';

@Injectable({
  providedIn: 'root'
})
export class CrudAdaptorPluginManager extends BasePluginManager<CrudAdaptorPlugin<string>, string> implements PluginManager<CrudAdaptorPlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'crud_adaptor' }));
  }
}
