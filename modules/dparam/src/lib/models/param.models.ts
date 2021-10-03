export class Param {
  mapping: Mapping;
  flags: Array<Flag>;
  constructor(data?: Param) {
    if(data) {
      this.mapping = new Mapping(data.mapping);
      if(data.flags !== undefined) {
        this.flags = data.flags.map(f => new Flag(f));
      }
    }
  }
}

export class Mapping {
  type: string;
  value: string;
  context: string;
  testValue: string;
  constructor(data?: Mapping) {
    if(data) {
      this.type = data.type;
      this.value = data.value;
      this.testValue = data.testValue;
      this.context = data.context;
    }
  }
}

export class Flag {
  name: string;
  enabled: boolean;
  constructor(data?: Flag) {
    if(data) {
      this.name = data.name;
      this.enabled = data.enabled;
    }
  }
}