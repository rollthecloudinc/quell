import { Injectable, Inject } from '@angular/core';
import { CONTEXT_PLUGIN } from '../context.tokens';
import { ContextPlugin } from '../models/context.models';

@Injectable({
  providedIn: 'root'
})
export class ContextManagerService {
  contextPlugins: Array<ContextPlugin>;
  constructor(@Inject(CONTEXT_PLUGIN) contextPlugins: Array<ContextPlugin>) {
    this.contextPlugins = contextPlugins;
  }
  getAll(globals?: boolean) {
    if(typeof(globals) === 'undefined') {
      return this.contextPlugins;
    } else if(globals) {
      return this.contextPlugins.filter(c => c.global);
    } else {
      return this.contextPlugins.filter(c => !c.global);
    }
  }
  getAllObjects(): Array<any> {
    return this.contextPlugins.map(cp => cp.baseObject);
  }
  lookupContext(name: string): ContextPlugin {
    return this.contextPlugins.find(c => c.name === name);
  }
  register(contextPlugin: ContextPlugin) {
    this.contextPlugins.push(contextPlugin);
  }
}
