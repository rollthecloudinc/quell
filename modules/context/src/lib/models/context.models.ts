import { Observable } from 'rxjs';
import { Type } from '@angular/core';
import { Rest } from 'datasource';
import { Snippet } from 'content';

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

export class InlineContext {
  name: string;
  adaptor: string;
  plugin?: string;
  rest?: Rest;
  snippet?: Snippet;
  data?: any;
  tokens?: Map<string, any>;
  constructor(data?: InlineContext) {
    this.name = data.name;
    this.adaptor = data.adaptor;
    if(data.plugin) {
      this.plugin = data.plugin;
    }
    if(this.adaptor === 'rest') {
      this.rest = new Rest(data.rest);
    } else if(this.adaptor === 'snippet' || this.adaptor === 'json') {
      this.snippet = new Snippet(data.snippet);
    } else if(this.adaptor === 'data') {
      this.data = data.data;
    } else if(this.adaptor === 'token') {
      this.tokens = new Map([ ...data.tokens ]);
    }
  }
}
