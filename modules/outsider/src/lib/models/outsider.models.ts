export class OutsideAppSettings {
  remoteEntry: string;
  moduleName: string;
  constructor(data?: OutsideAppSettings) {
    if (data) {
      this.remoteEntry = data.remoteEntry;
      this.moduleName = data.moduleName;
    }
  }
}