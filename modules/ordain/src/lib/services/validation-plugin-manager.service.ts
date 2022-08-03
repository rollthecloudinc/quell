import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { ValidationPlugin } from '../models/validation.models';
import { CoreValidationDiscovery } from '../discovery/core-validation-discovery';
import { FormsValidationUtils } from './forms-validation-utils.service';

@Injectable({
  providedIn: 'root'
})
export class ValidationPluginManager extends BasePluginManager<ValidationPlugin<string>, string> implements PluginManager<ValidationPlugin<string>, string> {
  constructor(
    formsValidationUtils: FormsValidationUtils,
    pcm: PluginConfigurationManager, 
    moduleLoader: ModuleLoaderService
  ) {
    super(pcm, moduleLoader);
    this.addDiscovery(new CoreValidationDiscovery(this, formsValidationUtils));
  }
  pluginDef() {
    return of(new PluginDef({ name: 'validation' }));
  }
  discovery(): void {
      super.discovery()
  }
}
