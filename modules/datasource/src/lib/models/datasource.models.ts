import { ContentBinding } from 'content';
import { Snippet } from 'snippet';
import { Param } from 'dparam';
import { Plugin } from '@ng-druid/plugin';
import { Type } from '@angular/core';
import { AttributeValue } from 'attributes';
import { Observable, of } from 'rxjs';

export class DatasourcePlugin<T = string> extends Plugin<T>  {
  editor: Type<any>;
  fetch: ({ settings, dataset, metadata, datasource, datasources }: { settings: Array<AttributeValue>, dataset?: Dataset, metadata?: Map<string, any>, datasource?: Datasource, datasources?: Map<string, Datasource> }) => Observable<Dataset>;
  getBindings?: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata?: Map<string, any> }) => Observable<Array<ContentBinding>>;
  editorOptions?: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata?: Map<string, any> }) => Observable<DatasourceEditorOptions>
  constructor(data?: DatasourcePlugin<T>) {
    super(data)
    if(data) {
      this.editor = data.editor;
      this.fetch = data.fetch;
      this.getBindings = data.getBindings ? data.getBindings : () => of([]);
      this.editorOptions = data.editorOptions ? data.editorOptions : () => of(new DatasourceEditorOptions());
    }
  }
}

export class Rest {
  url: string;
  renderer: Renderer;
  params: Array<Param>;
  body?: Snippet;
  method?: string;
  constructor(data?: Rest) {
    if(data) {
      this.url = data.url;
      this.method = data.method ? data.method : undefined;
      if(data.renderer !== undefined) {
        this.renderer = new Renderer(data.renderer);
      }
      if(data.params !== undefined) {
        this.params = data.params.map(p => new Param(p));
      }
      if (data.body) {
        this.body = new Snippet(data.body);
      }
    }
  }
}

export class Renderer {
  type: string;
  data: Snippet;
  query: string;
  trackBy: string;
  bindings: Array<ContentBinding>;  // Add DatasourceContentBinding - extends ContentBinding | datasource: - embedded datasource
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

export class Datasource {
  plugin: string;
  renderer?: Renderer;
  settings: Array<AttributeValue> = [];
  // params are going to be first class citizens because they are applicable to every source.
  params?: Array<Param> = [];
  constructor(data?: Datasource) {
    if (data) {
      this.plugin = data.plugin;
      if (data.renderer) {
        this.renderer = new Renderer(data.renderer);
      }
      if (data.settings) {
        this.settings = data.settings.map(s => new AttributeValue(s));
      }
      if (data.params) {
        this.params = data.params.map(p => new Param(p));
      }
    }
  }
}

export class DatasourceEditorOptions {
  fullscreen = false;
  constructor(data?: DatasourceEditorOptions) {
    if (data) {
      this.fullscreen = data.fullscreen;
    }
  }
}
