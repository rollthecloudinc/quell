import { Injectable } from "@angular/core";
import { BasePluginManager, PluginManager, PluginConfigurationManager, PluginDef } from "@ng-druid/plugin";
import { ModuleLoaderService } from '@ng-druid/utils';
import { of } from "rxjs";
import { DataductPlugin } from "../models/refinery.models";

@Injectable({
  providedIn: 'root'
})
export class DataductPluginManager extends BasePluginManager<DataductPlugin<string>, string> implements PluginManager<DataductPlugin<string>, string> {
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'dataduct' }));
  }
}