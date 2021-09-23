import { Injectable } from '@angular/core';
import { ContentHandler, ContentBinding } from 'content';
import { Dataset } from 'datasource';
import { AttributeValue, AttributeSerializerService } from 'attributes';
import { of, Observable } from 'rxjs';
import { PanelPage, Pane, Panel, LayoutSetting } from '../models/panels.models';

@Injectable({
  providedIn: 'root'
})
export class PanelContentHandler implements ContentHandler {

  constructor(private attributeSerializer: AttributeSerializerService) { }

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

  toObject(settings: Array<AttributeValue>): Observable<PanelPage> {
    return of(this.attributeSerializer.deserializeAsObject(settings));
  }

  buildSettings(panelPage: PanelPage): Array<AttributeValue> {
    return this.attributeSerializer.serialize(panelPage, 'root').attributes;
  }

  fromPanes(panesAsSettings: Array<AttributeValue>): Array<Pane> {
    return panesAsSettings.map(p => new Pane(this.attributeSerializer.deserialize(p)));
  }

  wrapPanel(panes: Array<Pane>): Panel {
    return new Panel({
      stylePlugin: undefined,
      settings: [],
      panes: panes,
      columnSetting: new LayoutSetting()
    });
  }

  stateDefinition(settings: Array<AttributeValue>): Observable<any> {
    return of({});
  }

}
