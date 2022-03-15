import { Injectable } from "@angular/core";
import { forkJoin, iif, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { PanelPageState, PanelState, PaneState } from "../models/state.models";
import { AttributeSerializerService } from '@ng-druid/attributes';
import { PanelPageForm, PanelPageFormPane, PanelPageFormPanel } from "../models/form.models";
import { Pane, Panel, PanelPage } from "../models/panels.models";

@Injectable({
  providedIn: 'root'
})
export class FormStateConverterService {
  constructor(
    private attributeSerializer: AttributeSerializerService
  ) {}
  convertPageToForm({ pp, pp2, ancestory, debugPath = [] } : { pp: PanelPageState, pp2: PanelPage, ancestory?: Array<number>, debugPath?: Array<string> }): Observable<PanelPageForm> {
    return of(new PanelPageState()).pipe(
      switchMap(() => forkJoin(
        pp.panels.map((p, index) => this.convertPanelToForm({ panel: p, panel2: pp2.panels[index], ancestory, debugPath: [ ...debugPath, `convertPageToForm{ index: ${index} }` ]  }))
      )),
      map(panels => new PanelPageForm({ id: pp.id, panels, name: pp2.name, title: pp2.title, derivativeId: '' }))
    );
  }
  convertPanelToForm({ panel, panel2, ancestory, debugPath = [] }: { panel: PanelState, panel2: Panel, ancestory?: Array<number>, debugPath?: Array<string> }): Observable<PanelPageFormPanel> {
    return of(new PanelPageFormPanel()).pipe(
      switchMap(() => forkJoin(
        panel.panes.map((p, index) => this.convertPaneToForm({ pane: p, pane2: panel2.panes[index], ancestory, debugPath: [ ...debugPath, `convertPanelToForm{ index: ${index} }` ] }))
      )),
      map(panes => new PanelPageFormPanel({ panes, name: panel2.name, label: panel2.label }))
    );
  }
  convertPaneToForm({ pane, pane2, ancestory, debugPath = [] } : { pane: PaneState, pane2: Pane, ancestory?: Array<number>, debugPath?: Array<string> }): Observable<PanelPageFormPane> {
    const value = pane.state.attributes.find(a => a.name === 'value');
    return of(new PanelPageFormPane({ settings: value ? [value] : [], name: pane2.name, label: pane2.label, contentPlugin: pane2.contentPlugin })).pipe(
      switchMap(form => iif(
        () => this.hasNestedPanelPage(pane),
        pane.nestedPage ? this.convertPageToForm({ ancestory, pp: pane.nestedPage, pp2: new PanelPage(this.attributeSerializer.deserializeAsObject(pane2.settings)), debugPath: [ ...debugPath, `convertPaneToForm` ] }).pipe(
          map(nestedPage => new PanelPageFormPane({ ...form, settings: this.attributeSerializer.serialize(nestedPage, 'root').attributes }))
        ): of(form),
        of(form)
      ))
    );
  }
  hasNestedPanelPage(pane: PaneState): boolean {
    return !!pane.nestedPage;
  }
}