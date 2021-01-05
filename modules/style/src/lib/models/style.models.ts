import { Type } from '@angular/core';
import { Plugin } from 'plugin';
export class StylePlugin<T = string> extends Plugin<T> {
  name: T;
  title: string;
  editorComponent: Type<any>;
  renderComponent: Type<any>;
  constructor(data?: StylePlugin<T>) {
    super(data);
    if (data) {
      this.name = this.id;
      this.title = data.title;
      this.editorComponent = data.editorComponent ? data.editorComponent: undefined;
      this.renderComponent = data.renderComponent ? data.renderComponent: undefined;
    }
  }
}
