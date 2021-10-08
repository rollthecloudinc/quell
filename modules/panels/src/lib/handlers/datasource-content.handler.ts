import { Injectable } from '@angular/core';
import { ContentHandler, ContentBinding } from 'content';
import { Dataset } from 'datasource';
import { AttributeValue } from 'attributes';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatasourceContentHandler implements ContentHandler {

  handleFile(file: File): Observable<Array<AttributeValue>> {
    return of();
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

  buildDynamicItems(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<Array<AttributeValue>> {
    return of([]);
  }

  fetchDynamicData(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<any> {
    return of(new Dataset());
  }

  getBindings(settings: Array<AttributeValue>, type: string): Observable<Array<ContentBinding>> {
    return of([]);
  }

  stateDefinition(settings: Array<AttributeValue>): Observable<any> {
    return of({});
  }

}