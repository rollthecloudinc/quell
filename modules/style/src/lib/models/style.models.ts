import { Type } from '@angular/core';
import { Plugin } from 'plugin';
import { Pane, Panel } from 'panels';
import { Observable } from 'rxjs';
import { AttributeValue } from 'attributes';

export interface StyleHandler {
  alterResolvedPanes(
    settings: Array<AttributeValue>,
    resolvedPanes: Array<Pane>, 
    originMappings: Array<number>,
    resolvedContexts: Array<any>
  ): Observable<[Array<Pane>, Array<number>, Array<any>]>;
}
export class StylePlugin<T = string> extends Plugin<T> {
  name: T;
  title: string;
  editorComponent: Type<any>;
  renderComponent: Type<any>;
  handler?: StyleHandler;
  constructor(data?: StylePlugin<T>) {
    super(data);
    if (data) {
      this.name = this.id;
      this.title = data.title;
      this.editorComponent = data.editorComponent ? data.editorComponent: undefined;
      this.renderComponent = data.renderComponent ? data.renderComponent: undefined;
      if (data.handler) {
        this.handler = data.handler;
      }
    }
  }
}
