import { Plugin } from '@rollthecloudinc/plugin';

export class InteractionOutcomePlugin<T = string> extends Plugin<T>  {
  // editor: Type<any>;
  // errorMessage: string;
  // builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => Observable<AsyncValidatorFn>;
  constructor(data?: InteractionOutcomePlugin<T>) {
    super(data)
    if(data) {
      // this.editor = data.editor;
      // this.errorMessage = data.errorMessage;
      // this.builder = data.builder;
    }
  }
}