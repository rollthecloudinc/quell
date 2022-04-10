export class OutsideAppSettings {
  type?: string;
  remoteEntry: string;
  componentName: string;
  exposedModule: string;
  remoteName?: string;
  constructor(data?: OutsideAppSettings) {
    if (data) {
      this.type = data.type && data.type !== '' ? data.type : 'module';
      this.remoteEntry = data.remoteEntry;
      this.componentName = data.componentName;
      this.exposedModule = data.exposedModule;
      this.remoteName = data.remoteName && data.remoteName !== '' ? data.remoteName : undefined;
    }
  }
}