import { Injectable } from '@angular/core';
import { ContentHandler, ContentBinding, ContentPluginEditorOptions } from 'content';
import { Dataset } from 'datasource';
import { AttributeValue, AttributeSerializerService } from 'attributes';
import { Observable, of } from 'rxjs';
import { FormSettings } from '../models/form.models';

@Injectable()
export abstract class AbstractFormContentHandler implements ContentHandler {

  constructor(
    private attributeSerializer: AttributeSerializerService
  ) { }

  handleFile(file: File): Observable<Array<AttributeValue>> {
    return of([]);
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

  isData(settings: Array<AttributeValue>): boolean {
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

  toObject(settings: Array<AttributeValue>): Observable<FormSettings> {
    return of(new FormSettings(this.attributeSerializer.deserializeAsObject(settings)));
  }

  buildSettings(instance: FormSettings): Array<AttributeValue> {
    return this.attributeSerializer.serialize(instance, 'root').attributes;
  }

  stateDefinition(settings: Array<AttributeValue>): Observable<any> {
    return of({ autocomplete: { input: '' }, value: undefined });
  }

  editorOptions(settings: Array<AttributeValue>): Observable<ContentPluginEditorOptions> {
    return of(new ContentPluginEditorOptions());
  }

}