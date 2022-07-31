import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { ValidationPlugin } from '../models/validation.models';
import { CoreValidationDiscovery } from '../discovery/core-validation-discovery';

@Injectable({
  providedIn: 'root'
})
export class ValidationPluginManager extends BasePluginManager<ValidationPlugin<string>, string> implements PluginManager<ValidationPlugin<string>, string> {
  constructor(
    paramsEvaluatorService: ParamEvaluatorService,
    attributesSerializerService: AttributeSerializerService,
    pcm: PluginConfigurationManager, 
    moduleLoader: ModuleLoaderService
  ) {
    super(pcm, moduleLoader);
    this.addDiscovery(new CoreValidationDiscovery(this, paramsEvaluatorService, attributesSerializerService));
  }
  pluginDef() {
    return of(new PluginDef({ name: 'validation' }));
  }
  discovery(): void {
      super.discovery()
  }
}
