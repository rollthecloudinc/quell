import { Renderer2, Type } from '@angular/core';
import { Plugin } from '@rollthecloudinc/plugin';
import { Observable } from 'rxjs';
import { InteractionListener } from './interaction.models';

export type InteractionEventCallbackInput = { handlerParams: {}, plugin: string, index: number, evt: any };
export type InteractionEventCallback = ({ handlerParams, plugin, index, evt }) => void
export type InteractionEventOutput = { };
export type InteractionEventInput = { filteredListeners: Array<InteractionListener>, listenerParams: {}, renderer: Renderer2, callback: InteractionEventCallback };

export class InteractionEventPlugin<T = string> extends Plugin<T>  {
  // editor: Type<any>;
  // errorMessage: string;
  // builder: ({ v, serialized }: { v: ValidationValidator, serialized: boolean }) => Observable<AsyncValidatorFn>;
  connect: ({ filteredListeners, listenerParams, renderer, callback }: InteractionEventInput) => Observable<InteractionEventOutput>;
  constructor(data?: InteractionEventPlugin<T>) {
    super(data)
    if(data) {
      // Probably should be required to have a connection.
      this.connect = data.connect;
      // this.editor = data.editor;
      // this.errorMessage = data.errorMessage;
      // this.builder = data.builder;
    }
  }
}