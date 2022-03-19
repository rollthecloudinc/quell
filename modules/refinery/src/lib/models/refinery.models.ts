import { Type } from '@angular/core';
import { Plugin } from '@ng-druid/plugin';
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
  constructor(data?: DuctdataInput) {
    if (data) {

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
      this.dataduct = new PersistenceFormDataduct(this.dataduct);
    }
  }
}

export class PersistenceFormDataduct {
  constructor(data?: PersistenceFormDataduct) {
    if (data) {

    }
  }
}