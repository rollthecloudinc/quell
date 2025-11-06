import { Type, Renderer2 } from '@angular/core';
import { Plugin } from '@rollthecloudinc/plugin';
import { InteractionListener } from './interaction.models';

export type InteractionHandlerInput = { handlerParams: {}, plugin: string, index: number, evt: any, listener: InteractionListener, renderer: Renderer2, panelPageComponent?: any }

export class InteractionHandlerPlugin<T = string> extends Plugin<T>  {
  // editor: Type<any>;
  // editor: Type<any>;
  // errorMessage: string;
  // builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => Observable<AsyncValidatorFn>;
  handle: ({ handlerParams, plugin, index, evt, listener, renderer, panelPageComponent } : InteractionHandlerInput) => void;
  constructor(data?: InteractionHandlerPlugin<T>) {
    super(data)
    if(data) {
      this.handle = data.handle;
      //this.editor = data.editor;
      // this.editor = data.editor;
      // this.errorMessage = data.errorMessage;
      // this.builder = data.builder;
    }
  }
}