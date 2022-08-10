import { Type } from '@angular/core';
import { Plugin } from '@rollthecloudinc/plugin';

export class InteractionHandlerPlugin<T = string> extends Plugin<T>  {
  // editor: Type<any>;
  // editor: Type<any>;
  // errorMessage: string;
  // builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => Observable<AsyncValidatorFn>;
  constructor(data?: InteractionHandlerPlugin<T>) {
    super(data)
    if(data) {
      //this.editor = data.editor;
      // this.editor = data.editor;
      // this.errorMessage = data.errorMessage;
      // this.builder = data.builder;
    }
  }
}