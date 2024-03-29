import { Injectable } from '@angular/core';
import { ContentHandler, ContentBinding, ContentPluginEditorOptions } from '@rollthecloudinc/content';
import { Snippet } from '@rollthecloudinc/snippet';
import { Dataset } from '@rollthecloudinc/datasource';
import { AttributeValue, AttributeWidget, AttributeTypes } from '@rollthecloudinc/attributes';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnippetContentHandler } from './snippet-content.handler';

@Injectable()
export class AttributeContentHandler implements ContentHandler {
  constructor(private snippetHandler: SnippetContentHandler) { }
  handleFile(file: File): Observable<Array<AttributeValue>> {
    return of([]);
  }
  handlesType(type: string): boolean {
    return false;
  }
  implementsRendererOverride(): boolean {
    return true;
  }

  hasRendererOverride(settings: Array<AttributeValue>): Observable<boolean> {
    return this.rendererSnippet(settings).pipe(
      map(snippet => snippet !== undefined)
    );
  }
  isDynamic(settings: Array<AttributeValue>): boolean {
    return false;
  }
  isData(settings: Array<AttributeValue>): boolean {
    return false;
  }
  fetchDynamicData(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<any> {
    return of(new Dataset());
  }
  buildDynamicItems(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<Array<AttributeValue>> {
    return of([]);
  }
  getBindings(settings: Array<AttributeValue>, type: string, metadata?: Map<string, any>): Observable<Array<ContentBinding>> {
    return of([]);
  }
  valueSettings(attributeValues: Array<AttributeValue>): Array<AttributeValue> {
    const settings = [];
    attributeValues.forEach(attributeValue => {
      if(attributeValue.name === 'value') {
        settings.push(attributeValue);
      }
    });
    return settings;
  }
  rendererSnippet(settings : Array<AttributeValue>): Observable<undefined | Snippet> {
    let snippet$: Observable<Snippet>;
    settings.forEach(s => {
      if(s.name === '_renderer') {
        snippet$ = this.snippetHandler.toObject(s.attributes);
      }
    });
    return snippet$ !== undefined ? snippet$ : of(undefined);
  }
  rendererOverrideSettings(snippet: Snippet) {
    return [new AttributeValue({
      name: '_renderer',
      type: AttributeTypes.Complex,
      displayName: 'Renderer Override',
      value: undefined,
      computedValue: undefined,
      intValue: 0,
      attributes: this.snippetHandler.buildSettings(snippet)
    })];
  }
  widgetSettings(widget: AttributeWidget<string>) {
    return [new AttributeValue({
      name: 'widget',
      type: widget.schema.type,
      displayName: 'Widget',
      value: widget.name,
      computedValue: widget.name,
      intValue: 0,
      attributes: []
    })];
  }
  stateDefinition(settings: Array<AttributeValue>): Observable<any> {
    return of({});
  }
  editorOptions(settings: Array<AttributeValue>): Observable<ContentPluginEditorOptions> {
    return of(new ContentPluginEditorOptions());
  }
}
