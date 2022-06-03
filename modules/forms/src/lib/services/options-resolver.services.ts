import { Injectable } from "@angular/core";
import { SelectOption } from '@rollthecloudinc/datasource';
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { TokenizerService } from '@rollthecloudinc/token';
import { FormSettings } from "../models/form.models";
import { JSONPath } from 'jsonpath-plus';
import { DatasourceContentHandler, Pane, PanelResolverService } from '@rollthecloudinc/panels';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';

@Injectable({
  providedIn: 'root'
})
export class OptionsResolverService {

  constructor(
    private tokenizerService: TokenizerService,
    private datasourceContentHandler: DatasourceContentHandler,
    private panelResolver: PanelResolverService,
    private attributeSerializer: AttributeSerializerService
  ) {}

  resolveElementOptions(instance: FormSettings, metadata?: Map<string,any>): Observable<Array<SelectOption>> {
    return of(instance).pipe(
      switchMap(i => {
        if (i.datasourceBinding && i.datasourceBinding.id && i.datasourceBinding.id !== '' /*&& i.type !== 'autocomplete'*/) {
            const dataPane = metadata.has('panes') ? (metadata.get('panes') as Array<Pane>).find(p => p.name === i.datasourceBinding.id) : undefined;
            return this.panelResolver.dataPanes(metadata.get('panes') as Array<Pane>).pipe(
              switchMap(dataPanes => dataPane ? this.datasourceContentHandler.fetchDynamicData(dataPane.settings, new Map<string, any>([ ...metadata, [ 'dataPanes', dataPanes ] ])) : of([])),
              map(d => [i, d.results])
            );
        } else {
          return of<[FormSettings, Array<SelectOption>]>([i, []]);
        }
      }),
      map(([i, d]) => [i, i.datasourceOptions && i.datasourceOptions.query !== '' ? JSONPath({ path: i.datasourceOptions.query, json: d }) : d]),
      switchMap(([i, d]) => this.mapDataOptions(i, d))
    );
  }

  mapDataOptions(instance: FormSettings, data: Array<any>): Observable<Array<any>> {
    return of([instance, data]).pipe(
      map<[FormSettings, Array<any>], [FormSettings, Array<any>, Array<Map<string, any>>]>(([i, d]) => [i, d, d ? d.map(r => this.tokenizerService.generateGenericTokens(r)) : []]),
      map<[FormSettings, Array<any>, Array<Map<string, any>>], Array<SelectOption>>(([i, d, tokens]) => tokens.map(t => this.mapDataItem(i, t))),
      // map(([d, tokens, mapping]) => tokens.map((t,i) => new SelectOption({ dataItem: d.results[i], value: mapping.value === '[.]'  ? this.attributeSerializer.serialize(d.results[i], 'value') : this.attributeSerializer.serialize(this.tokenizerService.replaceTokens(mapping.value, t), 'value'), label: this.tokenizerService.replaceTokens(mapping.label, t) })))
    );
  }

  mapDataItem(instance: FormSettings, tokens: Map<string, any>): SelectOption {
    return new SelectOption({
      value: this.tokenizerService.replaceTokens(`${instance.datasourceOptions.valueMapping}`, tokens),
      label: this.tokenizerService.replaceTokens(`${instance.datasourceOptions.labelMapping}`, tokens),
      dataItem: undefined
      // display: this.tokenizerService.replaceTokens(`${instance.datasourceOptions.labelMapping}`, tokens)
    });
  }

  hasDataOptions(instance: FormSettings): boolean {
    return instance.datasourceBinding && instance.datasourceBinding.id && instance.datasourceBinding.id !== '';
  }

} 