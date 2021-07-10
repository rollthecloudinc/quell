import { Injectable } from '@angular/core';
import { ContentHandler, ContentBinding } from 'content';
import { Dataset } from 'datasource';
import { AttributeValue, AttributeSerializerService } from 'attributes';
import { Observable, of } from 'rxjs';
import { FormlyFieldInstance } from '../models/formly.models';
import { switchMap } from 'rxjs/operators';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyHandlerHelper } from '../services/formly-handler-helper.service';
@Injectable()
export class FormlyFieldContentHandler implements ContentHandler {

  constructor(
    private attributeSerializer: AttributeSerializerService,
    private formlyHandlerHelper: FormlyHandlerHelper
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

  getBindings(settings: Array<AttributeValue>, type: string, metadata?: Map<string, any>): Observable<Array<ContentBinding>> {
    return of([]);
  }

  fetchDynamicData(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<any> {
    return of(new Dataset());
  }

  buildDynamicItems(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<Array<AttributeValue>> {
    return of([]);
  }

  toObject(settings: Array<AttributeValue>): Observable<FormlyFieldInstance> {
    return of(new FormlyFieldInstance(this.attributeSerializer.deserializeAsObject(settings)));
  }

  buildSettings(instance: FormlyFieldInstance): Array<AttributeValue> {
    return this.attributeSerializer.serialize(instance, 'root').attributes;
  }

  buildFieldConfig(settings: Array<AttributeValue>): Observable<FormlyFieldConfig> {
    return this.toObject(settings).pipe(
      switchMap(i => this.formlyHandlerHelper.buildFieldConfig(i))
    );
  }

}