import { Type } from '@angular/core';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { Plugin } from '@rollthecloudinc/plugin';
import { Observable } from 'rxjs';

export interface ContentHandler {
  handleFile(file: File): Observable<Array<AttributeValue>>;
  handlesType(type: string): boolean;
  implementsRendererOverride(): boolean;
  hasRendererOverride(settings: Array<AttributeValue>): Observable<boolean>
  isDynamic(settings: Array<AttributeValue>): boolean;
  isData(settings: Array<AttributeValue>): boolean;
  getBindings(settings: Array<AttributeValue>, type: string, metadata?: Map<string, any>): Observable<Array<ContentBinding>>;
  fetchDynamicData(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<any>;
  buildDynamicItems(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<Array<AttributeValue>>;
  stateDefinition(settings: Array<AttributeValue>): Observable<any>;
  editorOptions(settings: Array<AttributeValue>): Observable<ContentPluginEditorOptions>;
}

export class ContentPlugin<T = string> extends Plugin<T> {
  name?: T;
  fileTypes?: Array<string> = [];
  handler?: ContentHandler;
  selectionComponent: Type<any>;
  renderComponent: Type<any>;
  editorComponent: Type<any>;
  constructor(data?: ContentPlugin<T>) {
    super(data);
    if (data) {
      this.name = this.id;
      this.handler = data.handler !== undefined ? data.handler: undefined;
      this.selectionComponent = data.selectionComponent ? data.selectionComponent : undefined;
      this.renderComponent = data.renderComponent ? data.renderComponent : undefined;
      this.editorComponent = data.editorComponent ? data.editorComponent : undefined;
    }
  }
}

export class ContentBinding {
  type: string;
  id: string;
  constructor(data?: ContentBinding) {
    if(data) {
      this.type = data.type;
      this.id = data.id;
    }
  }
}

export class ContentInstance {
  pluginName: string;
  settings: Array<AttributeValue> = [];
  constructor(data?: ContentInstance) {
    if (data) {
      this.pluginName = data.pluginName;
      if(data.settings) {
        this.settings = data.settings.map(s => new AttributeValue(s));
      }
    }
  }
}

/*export class Snippet {
  content: string;
  contentType: string;
  jsFile?: string;
  jsScript?: string;
  constructor(data?: Snippet) {
    if(data) {
      this.content = data.content;
      this.contentType = data.contentType;
      if (data.jsFile && data.jsFile !== '') {
        this.jsFile = data.jsFile;
      }
      if (data.jsScript && data.jsScript !== '') {
        this.jsScript = data.jsScript;
      }
    }
  }
}*/

export class ContentPluginEditorOptions {
  fullscreen = false;
  constructor(data?: ContentPluginEditorOptions) {
    if (data) {
      this.fullscreen = data.fullscreen;
    }
  }
}
