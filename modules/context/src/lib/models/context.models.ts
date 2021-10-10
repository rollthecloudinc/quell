import { Observable, of } from 'rxjs';
import { Type } from '@angular/core';
import { Rest } from 'datasource';
import { Snippet } from 'snippet';
import { Plugin } from 'plugin';

export interface ContextResolver {
  resolve(ctx: ContextPlugin, data?: any): Observable<any>
  resolve(ctx: ContextPlugin, data?: any, meta?: Map<string, any>): Observable<any>
}

export class ContextPlugin<T = string> extends Plugin<T>  {
  name: T;
  title: string;
  baseObject: any;
  resolver: ContextResolver;
  editorComponent?: Type<any>;
  global? = false;
  group?: string;
  internal?: boolean;
  constructor(data?: ContextPlugin<T>) {
    super(data)
    if (data) {
      this.name = this.id;
      this.title = data.title;
      this.baseObject = data.baseObject;
      this.resolver = data.resolver;
      this.global = data.global === undefined ? false: data.global;
      this.internal = data.internal === undefined ? false : data.internal;
      this.group = data.group !== undefined ? data.group : undefined;
      if(data.editorComponent) {
        this.editorComponent = data.editorComponent;
      }
    }
  }
  /*public beforeResolve(data: { inlineContext: InlineContext }): Observable<{ inlineContext: InlineContext }> {
    return of({ inlineContext: data.inlineContext });
  }*/
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

export class ContextDatasource {
  name: string;
  constructor(data?: ContextDatasource) {
    if (data) {
      this.name = data.name;
    }
  }
}
