export class FormSettings {
  name: string;
  label: string;
  constructor(data?: FormSettings) {
    if (data) {
      this.name = data.name;
      this.label = data.label;
    }
  }
}