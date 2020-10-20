import { Injectable } from '@angular/core';
import { ContentHandler, ContentBinding } from '@classifieds-ui/content';
import { TokenizerService } from '@classifieds-ui/token';
import { MediaFile } from '@classifieds-ui/media';
import { AttributeValue, AttributeSerializerService } from '@classifieds-ui/attributes';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DataSlice } from '../models/plugin.models';
import { InlineContext } from '../models/context.models';
import { MediaContentHandler } from './media-content.handler';
import { PanelContentHandler } from './panel-content.handler';
import { Pane, Panel, PanelPage } from '../models/page.models';
import { Dataset } from '../models/datasource.models';
import { InlineContextResolverService } from '../services/inline-context-resolver.service';

@Injectable()
export class SliceContentHandler implements ContentHandler {

  constructor(
    private tokenizerService: TokenizerService,
    private panelHandler: PanelContentHandler,
    private mediaHandler: MediaContentHandler,
    private attributeSerializer: AttributeSerializerService,
    private inlineContextResolver: InlineContextResolverService
  ) { }

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
    return true;
  }

  fetchDynamicData(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<any> {
    return of(new Dataset());
  }

  buildDynamicItems(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<Array<AttributeValue>> {
    return this.toObject(settings).pipe(
      map(slice => [slice, metadata.get('contexts').find((c: InlineContext)  => c.name === slice.context)]),
      switchMap(([slice, context]) => this.extractDataArray(context, slice.query).pipe(
        map(data => [slice, context, data])
      )),
      switchMap(([slice, context, dataArray]) => this.transformDataArray(dataArray, slice.plugin)),
      map(panes => new Panel({ stylePlugin: undefined, settings: [], panes })),
      map(panel => this.panelHandler.buildSettings(new PanelPage({ id: undefined, layoutType: 'grid', displayType: 'page', gridItems: [], panels: [ panel ] }))),
      map(panelSettings => panelSettings.find(s => s.name === 'panels').attributes[0].attributes.find(s => s.name === 'panes').attributes)
    );
  }

  getBindings(settings: Array<AttributeValue>, type: string, metadata?: Map<string, any>): Observable<Array<ContentBinding>> {
    if(type === 'context') {
      return this.toObject(settings).pipe(
        map(slice => [new ContentBinding({ id: slice.context, type: 'context' })])
      );
    } else {
      return of([]);
    }
  }

  toObject(settings: Array<AttributeValue>): Observable<DataSlice> {
    return of(this.attributeSerializer.deserializeAsObject(settings));
  }

  buildSettings(dataSlice: DataSlice): Array<AttributeValue> {
    return this.attributeSerializer.serialize(dataSlice, 'root').attributes;
  }

  extractDataArray(context: InlineContext, query: string): Observable<Array<any>> {
    return this.inlineContextResolver.resolve(context).pipe(
      map(data => {
        const pieces = query.split('.');
        const len = pieces.length;
        if(context === undefined) {
          return of([]);
        }
        let current = Array.isArray(data) ? data[0] : data;
        for(let i = 0; i < len; i++) {
          if(pieces[i] === '') {
            continue;
          }
          current = current[pieces[i]];
        }
        return current;
      })
    );
  }

  transformDataArray(dataArray: Array<any>, plugin: string): Observable<Array<Pane>> {
    if(plugin === 'media') {
      return of(dataArray.map(d => new MediaFile(d)).map(m => new Pane({ contentPlugin: 'media', name: undefined, label: undefined, settings: this.mediaHandler.buildSettings(m) })));
    } else {
      return of();
    }
  }

}
