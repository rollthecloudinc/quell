export class FormlyFieldInstance {
  type: string;
  key: string;
  constructor(data?: FormlyFieldInstance) {
    if (data) {
      this.type = data.type;
      this.key = data.key;
    }
  }
}