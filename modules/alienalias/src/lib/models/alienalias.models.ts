import { AliasPlugin } from '@rollthecloudinc/alias';

export class AlienaliasPlugin extends AliasPlugin {
}

export class AlienAlias {
  id: string;
  site: string;
  path: string;
  // type: 'script' | 'module';
  remoteEntry: string;
  // exposedModule: string;
  moduleName: string;
  constructor(data?: AlienAlias) {
    if (data) {
      this.id = data.id;
      this.site = data.site;
      this.path = data.path;
      // this.type = data.type;
      this.remoteEntry = data.remoteEntry;
      // this.exposedModule = data.exposedModule;
      this.moduleName = data.moduleName;
    }
  }
}


export class AlienaliasSettings {
  openSearchDomain: string;
  constructor(data?: AlienaliasSettings) {
    if(data) {
      this.openSearchDomain = data.openSearchDomain;
    }
  }
}