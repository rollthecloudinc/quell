import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { ValidationPlugin } from '../models/validation.models';
import { CoreValidationDiscovery } from '../discovery/core-validation-discovery';

@Injectable({
  providedIn: 'root'
})
export class ValidationPluginManager extends BasePluginManager<ValidationPlugin<string>, string> implements PluginManager<ValidationPlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'validation' }));
  }
  discovery(): void {
      super.discovery()
      // Discovery for core anguklar validators.
      this.addDiscovery(new CoreValidationDiscovery(this));
  }
}
