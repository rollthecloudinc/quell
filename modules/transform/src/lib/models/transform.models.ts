export class SelectTransform {
  query: string;
  constructor(data?: SelectTransform) {
    if (data) {
      this.query = data.query;
    }
  }
}