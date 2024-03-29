import { Type } from '@angular/core';
import { Plugin } from '@rollthecloudinc/plugin';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { Observable } from 'rxjs';

export class DataductPlugin<T = string> extends Plugin<T>  {
  editor?: Type<any>;
  send: (input: DuctdataInput) => Observable<DuctdataOutput>;
  constructor(data?: DataductPlugin<T>) {
    super(data)
    if(data) {
      this.editor = data.editor;
      this.send = data.send;
    }
  }
}

export class DuctdataInput {
  data: any;
  settings: Array<AttributeValue> = [];
  constructor(data?: DuctdataInput) {
    if (data) {
      this.data = data.data;
      if (data.settings && Array.isArray(data.settings)) {
        this.settings = data.settings.map(s => new AttributeValue(s));
      }
    }
  }
}

export class DuctdataOutput {
  constructor(data: DuctdataOutput) {
    if (data) {

    }
  }
}

export class PersistenceFormPayload {
  dataduct: PersistenceFormDataduct;
  constructor(data?: PersistenceFormPayload) {
    if (data) {
      this.dataduct = new PersistenceFormDataduct(data.dataduct);
    }
  }
}

export class PersistenceFormDataduct {
  plugin: string;
  settings: Array<AttributeValue> = [];
  constructor(data?: PersistenceFormDataduct) {
    if (data) {
      this.plugin = data.plugin;
      if (data.settings && Array.isArray(data.settings)) {
        this.settings = data.settings.map(s => new AttributeValue(s));
      }
    }
  }
}