import { Injectable } from "@angular/core";
import { FormlyTemplateOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { DatasourceHttpService, DatasourceApiService } from "datasource";
import { iif, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { TokenizerService } from "token";
import { FormlyFieldInstance } from "../models/formly.models";
import { JSONPath } from 'jsonpath-plus';

@Injectable({
  providedIn: 'root'
})
export class FormlyHandlerHelper {

  constructor(
    private datasourceHttp: DatasourceHttpService,
    private datasourceApi: DatasourceApiService,
    private tokenizerService: TokenizerService
  ) {}

  buildFieldConfig(instance: FormlyFieldInstance): Observable<FormlyFieldConfig> {
    return of(instance).pipe(
      switchMap(i => iif(
        () => !!i.options,
        this.buildTemplateOptions(i).pipe(
          map<FormlyTemplateOptions,[FormlyFieldInstance, FormlyTemplateOptions]>(t => [i, t])
        ),
        of<[FormlyFieldInstance, FormlyTemplateOptions]>([i, {}])
      )),
      map(([i, t]) => ({ key: 'value', type: i.type, templateOptions: t }))
    );
  }

  buildTemplateOptions(instance: FormlyFieldInstance): Observable<FormlyTemplateOptions> {
    return of(instance).pipe(
      map<FormlyFieldInstance, [FormlyFieldInstance, FormlyTemplateOptions]>(i => [i, { label:  i.options.label, multiple: i.datasourceOptions ? i.datasourceOptions.multiple : false, options: [] }]),
      switchMap(([i, t]) => iif(
        () => this.hasDataOptions(i),
        this.buildDataOptions(i).pipe(
          map<Array<any>, [FormlyTemplateOptions, Array<any>]>(opts => [t, opts])
        ),
        of<[FormlyTemplateOptions, Array<any>]>([t, []])
      )),
      map(([t, options]) => ({ ...t, options }))
    );
  }

  buildDataOptions(instance: FormlyFieldInstance): Observable<Array<any>> {
    return of(instance).pipe(
      switchMap(i => {
        if (i.rest) {
          return this.buildRestDataOptions(i).pipe(
            map<Array<any>, [FormlyFieldInstance, Array<any>]>(d => [i, d])
          );
        } else {
          return of<[FormlyFieldInstance, Array<any>]>([i, []]);
        }
      }),
      map(([i, d]) => [i, i.datasourceOptions && i.datasourceOptions.query !== '' ? JSONPath({ path: i.datasourceOptions.query, json: d }) : d]),
      switchMap(([i, d]) => this.mapDataOptions(i, d))
    );
  }

  buildRestDataOptions(instance: FormlyFieldInstance): Observable<Array<any>> {
    return of(instance).pipe(
      switchMap(i => this.datasourceHttp.getUrl(i.rest.url, i.rest.params, new Map<string, any>([]))),
      switchMap(s => this.datasourceApi.getData(`${s}`))
    );
  }

  mapDataOptions(instance: FormlyFieldInstance, data: Array<any>): Observable<Array<any>> {
    return of([instance, data]).pipe(
      map<[FormlyFieldInstance, Array<any>], [FormlyFieldInstance, Array<any>, Array<Map<string, any>>]>(([i, d]) => [i, d, d.map(r => this.tokenizerService.generateGenericTokens(r))]),
      map<[FormlyFieldInstance, Array<any>, Array<Map<string, any>>], Array<any>>(([i, d, tokens]) => tokens.map(t => this.mapDataItem(i, t))),
      // map(([d, tokens, mapping]) => tokens.map((t,i) => new SelectOption({ dataItem: d.results[i], value: mapping.value === '[.]'  ? this.attributeSerializer.serialize(d.results[i], 'value') : this.attributeSerializer.serialize(this.tokenizerService.replaceTokens(mapping.value, t), 'value'), label: this.tokenizerService.replaceTokens(mapping.label, t) })))
    );
  }

  mapDataItem(instance: FormlyFieldInstance, tokens: Map<string, any>): any {
    return {
      value: this.tokenizerService.replaceTokens(`[${instance.datasourceOptions.valueMapping}]`, tokens),
      label: this.tokenizerService.replaceTokens(`[${instance.datasourceOptions.labelMapping}]`, tokens)
    };
  }

  hasDataOptions(instance: FormlyFieldInstance): boolean {
    return !!instance.rest && instance.rest.url && instance.rest.url.trim() !== '';
  }

} 