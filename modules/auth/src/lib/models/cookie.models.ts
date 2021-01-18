export class Cookie {
  name: string;
  value: string;
  constructor(data?: Cookie) {
    if (data) {
      this.name = data.name;
      this.value = data.value;
    }
  }
}
