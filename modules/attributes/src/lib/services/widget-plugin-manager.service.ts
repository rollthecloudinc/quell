import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { ModuleLoaderService } from '@ng-druid/utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager } from '@ng-druid/plugin';
import { AttributeWidget } from '../models/attributes.models';

@Injectable({
  providedIn: 'root'
})
export class WidgetPluginManager extends BasePluginManager<AttributeWidget<string>, string> implements PluginManager<AttributeWidget<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'widget' }));
  }
}
