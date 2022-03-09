import { Injectable } from '@angular/core';
import { ContentHandler, ContentBinding, ContentPluginEditorOptions } from 'content';
import { Dataset, Datasource, DatasourcePluginManager } from 'datasource';
import { AttributeValue, AttributeSerializerService } from '@ng-druid/attributes';
import { iif, Observable, of } from 'rxjs';
import { FormlyFieldInstance } from '../models/formly.models';
import { map, switchMap, tap } from 'rxjs/operators';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyHandlerHelper } from '../services/formly-handler-helper.service';
import { DatasourceContentHandler, Pane } from 'panels';
@Injectable()
export class FormlyFieldContentHandler implements ContentHandler {

  constructor(
    private attributeSerializer: AttributeSerializerService,
    private formlyHandlerHelper: FormlyHandlerHelper,
    private datasourceHandler: DatasourceContentHandler,
    private dpm: DatasourcePluginManager
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
    // return of([ new ContentBinding({ id: 'ad', type: 'context' }) ]);
    // return of([]);
    if (type === 'pane') {
      return this.toObject(settings).pipe(
        switchMap(i => iif(
          () => i.datasourceBinding && i.datasourceBinding.id && i.datasourceBinding.id !== null,
          of([ i.datasourceBinding ]),
          of([])
        ))
      );
      return of([]);
    } else if (type === 'context') {
      // Needs to include datasource panes bindings as well.
      /*return this.toObject(settings).pipe(
        map(i => ({ i, dsPane: metadata && i.datasourceBinding && i.datasourceBinding.id && i.datasourceBinding.id !== null ? (metadata.get('dataPanes') as Array<Pane>).find(p => p.name === i.datasourceBinding.id) : undefined })),
        switchMap(({ dsPane }) => iif(
          () => !!dsPane,
          this.datasourceHandler.toObject(dsPane.settings).pipe(
            switchMap(bindedDatasource => iif(
              // Params from rest need to be hoisted into the datasource - this is a legacy work-around new datasources will have params in datasource object not nested.
              () => bindedDatasource.plugin === 'rest',
              of(this.attributeSerializer.deserializeAsObject(bindedDatasource.settings)).pipe(
                map(bSettings => ({ bindedDatasource: new Datasource({ ...bindedDatasource, params: bSettings.params }) }))
              ),
              of({ bindedDatasource })
            )),
            map(({ bindedDatasource }) => ({ dsPane: new Pane({ ...dsPane, settings: this.attributeSerializer.serialize(bindedDatasource, 'root').attributes }) })),
          ),
          of({ dsPane })
        )),
        switchMap(({ dsPane }) => iif(
          () => !!dsPane,
          dsPane ? this.datasourceHandler.getBindings(dsPane.settings, type, metadata) : of([]),
          of([])
        )),
        tap(bindings => console.log('formly field context bindings', bindings))
      );*/
      return of([]);
    } else {
      return of([]);
    }
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

  buildFieldConfig(settings: Array<AttributeValue>, metadata?: Map<string, any>): Observable<FormlyFieldConfig> {
    return this.toObject(settings).pipe(
      switchMap(i => this.formlyHandlerHelper.buildFieldConfig(i, metadata))
    );
  }

  stateDefinition(settings: Array<AttributeValue>): Observable<any> {
    return of({ autocomplete: { input: '' }, value: undefined });
  }

  editorOptions(settings: Array<AttributeValue>): Observable<ContentPluginEditorOptions> {
    return of(new ContentPluginEditorOptions());
  }

}