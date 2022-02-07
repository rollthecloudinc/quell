export class OutsideAppSettings {
  remoteEntry: string;
  componentName: string;
  exposedModule: string;
  constructor(data?: OutsideAppSettings) {
    if (data) {
      this.remoteEntry = data.remoteEntry;
      this.componentName = data.componentName;
      this.exposedModule = data.exposedModule;
    }
  }
}