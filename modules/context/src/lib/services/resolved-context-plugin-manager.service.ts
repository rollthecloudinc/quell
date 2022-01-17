import { Injectable } from '@angular/core';
import { of, ReplaySubject, Subject } from 'rxjs';
import { ModuleLoaderService } from 'utils';
import { BasePluginManager, PluginManager, PluginDef, PluginConfigurationManager, Plugin } from 'plugin';
import { ResolvedContextPlugin } from '../models/resolved-context.models';

@Injectable({
  providedIn: 'root'
})
export class ResolvedContextPluginManager extends BasePluginManager<ResolvedContextPlugin<string>, string> implements PluginManager<ResolvedContextPlugin<string>, string> {
  readonly add$ = new ReplaySubject(1);
  constructor(pcm: PluginConfigurationManager, moduleLoader: ModuleLoaderService) {
    super(pcm, moduleLoader);
  }
  pluginDef() {
    return of(new PluginDef({ name: 'resolved_context' }));
  }
  register(plugin: ResolvedContextPlugin<string>) {
    const hasPlugin = this.pluginInstances.has(plugin.id);
    super.register(plugin);
    if (!hasPlugin) {
      this.add$.next(undefined);
    }
  }
}
