/*import { ContentBinding, Snippet } from 'content';
import { Param, Mapping, Flag } from 'url';

export class Rest {
  url: string;
  renderer: Renderer;
  params: Array<Param>;
  constructor(data?: Rest) {
    if(data) {
      this.url = data.url;
      if(data.renderer !== undefined) {
        this.renderer = new Renderer(data.renderer);
      }
      if(data.params !== undefined) {
        this.params = data.params.map(p => new Param(p));
      }
    }
  }
}

export class Renderer {
  type: string;
  data: Snippet;
  query: string;
  trackBy: string;
  bindings: Array<ContentBinding>;
  constructor(data?: Renderer) {
    if(data) {
      this.type = data.type;
      this.query = data.query;
      this.trackBy = data.trackBy;
      if(data.data !== undefined) {
        this.data = new Snippet(data.data);
      }
      if(data.bindings !== undefined) {
        this.bindings = data.bindings.map(b => new ContentBinding(b));
      }
    }
  }
}

export class Dataset {
  results: Array<any> = [];
  constructor(data?: Dataset) {
    if(data) {
      this.results = data.results;
    }
  }
}*/
