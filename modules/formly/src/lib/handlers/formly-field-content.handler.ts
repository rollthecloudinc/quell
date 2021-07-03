import { Injectable } from '@angular/core';
import { ContentHandler, ContentBinding, Snippet } from 'content';
import { Dataset } from 'datasource';
import { AttributeValue, AttributeSerializerService } from 'attributes';
import { TokenizerService } from 'token';
import { Observable, of } from 'rxjs';

@Injectable()
export class FormlyFieldContentHandler implements ContentHandler {

  constructor(
    private attributeSerializer: AttributeSerializerService,
    private tokenizrService: TokenizerService
  ) { }

  handleFile(file: File): Observable<Array<AttributeValue>> {
    return new Observable(obs => {
      const reader = new FileReader();
      reader.onload = () => {
        obs.next(this.buildSettings(new Snippet({ contentType: file.type, content: `${reader.result}`})));
        obs.complete();
      }
      reader.readAsText(file);
    });
  }

  handlesType(type: string): boolean {
    return false;
  }

  implementsRendererOverride(): boolean {
    return false;
  }

  hasRendererOverride(settings: Array<AttributeValue>): Observable<boolean> {
    return of(false);
  }

  isDynamic(settings: Array<AttributeValue>): boolean {
    return false;
  }

  getBindings(settings: Array<AttributeValue>, type: string, metadata?: Map<string, any>): Observable<Array<ContentBinding>> {
    return of([]);
  }

  fetchDynamicData(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<any> {
    return of(new Dataset());
  }

  buildDynamicItems(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<Array<AttributeValue>> {
    return of([]);
  }

  toObject(settings: Array<AttributeValue>): Observable<Snippet> {
    return of(new Snippet(this.attributeSerializer.deserializeAsObject(settings)));
  }

  buildSettings(snippet: Snippet): Array<AttributeValue> {
    return this.attributeSerializer.serialize(snippet, 'root').attributes;
  }

}