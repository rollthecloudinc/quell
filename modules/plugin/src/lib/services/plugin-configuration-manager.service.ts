import { Injectable } from '@angular/core';
import { PluginConfig } from '../models/plugin.models';

@Injectable({
  providedIn: 'root'
})
export class PluginConfigurationManager {
  private configs: Array<PluginConfig> = [];
  addConfig(cfg: PluginConfig) {
    this.configs.push(cfg);
  }
  getConfigs(): Array<PluginConfig> {
    return this.configs;
  }
}
