import { ContentBinding, Snippet } from 'content';
import { Param } from 'dparam';

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
}

export class DatasourceOptions {
  query: string;
  trackBy: string;
  idMapping: string;
  labelMapping: string;
  valueMapping: string;
  multiple: boolean;
  limit: number;
  constructor(data?: DatasourceOptions) {
    if (data) {
      this.query = data.query;
      this.trackBy = data.trackBy;
      this.idMapping = data.idMapping;
      this.labelMapping = data.labelMapping;
      this.valueMapping = data.valueMapping;
      this.multiple = data.multiple;
      this.limit = data.limit;
    }
  }
}
