import { Type } from '@angular/core';
import { Plugin } from '@rollthecloudinc/plugin';

export class ValidationPlugin<T = string> extends Plugin<T>  {
  editor: Type<any>;
  constructor(data?: ValidationPlugin<T>) {
    super(data)
    if(data) {
      this.editor = data.editor;
    }
  }
}
