import { Rest } from './datasource.models';
import { Snippet } from './plugin.models';

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
