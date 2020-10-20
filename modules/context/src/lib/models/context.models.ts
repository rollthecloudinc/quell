import { Observable } from 'rxjs';
import { Type } from '@angular/core';

export interface ContextResolver {
  resolve(ctx: ContextPlugin, data?: any): Observable<any>
}

export class ContextPlugin {
  name: string
  title: string;
  baseObject: any;
  resolver: ContextResolver;
  editorComponent?: Type<any>;
  global? = false;
  group?: string;
  constructor(data?: ContextPlugin) {
    if (data) {
      this.name = data.name;
      this.title = data.title;
      this.baseObject = data.baseObject;
      this.resolver = data.resolver;
      this.global = data.global === undefined ? false: data.global;
      this.group = data.group !== undefined ? data.group : undefined;
      if(data.editorComponent) {
        this.editorComponent = data.editorComponent;
      }
    }
  }
}
