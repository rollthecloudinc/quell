import { Injectable } from "@angular/core";
import { BasePluginManager, PluginManager, PluginConfigurationManager, PluginDef } from "@rollthecloudinc/plugin";
import { ModuleLoaderService } from '@rollthecloudinc/utils';
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