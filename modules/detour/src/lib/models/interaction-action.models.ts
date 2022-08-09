import { Type } from '@angular/core';
import { Plugin } from '@rollthecloudinc/plugin';

export class InteractionActionPlugin<T = string> extends Plugin<T>  {
  editor: Type<any>;
  // errorMessage: string;
  // builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => Observable<AsyncValidatorFn>;
  constructor(data?: InteractionActionPlugin<T>) {
    super(data)
    if(data) {
      this.editor = data.editor;
      // this.errorMessage = data.errorMessage;
      // this.builder = data.builder;
    }
  }
}