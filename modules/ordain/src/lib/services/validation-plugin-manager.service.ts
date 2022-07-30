import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@rollthecloudinc/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@rollthecloudinc/plugin';
import { ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { ValidationPlugin } from '../models/validation.models';
import { CoreValidationDiscovery } from '../discovery/core-validation-discovery';

@Injectable({
  providedIn: 'root'
})
export class ValidationPluginManager extends BasePluginManager<ValidationPlugin<string>, string> implements PluginManager<ValidationPlugin<string>, string> {
  private paramsEvaluatorService: ParamEvaluatorService;
  constructor(
    paramsEvaluatorService: ParamEvaluatorService,
    pcm: PluginConfigurationManager, 
    moduleLoader: ModuleLoaderService
  ) {
    super(pcm, moduleLoader);
    this.paramsEvaluatorService = paramsEvaluatorService;
    this.addDiscovery(new CoreValidationDiscovery(this, this.paramsEvaluatorService));
  }
  pluginDef() {
    return of(new PluginDef({ name: 'validation' }));
  }
  discovery(): void {
      super.discovery()
  }
}
