export class PagesSettings {
  disableRouting = false;
  constructor(data?: PagesSettings) {
    if (data) {
      this.disableRouting = data.disableRouting;
    }
  }
}