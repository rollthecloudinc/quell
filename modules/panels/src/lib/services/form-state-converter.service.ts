import { Injectable } from "@angular/core";
import { forkJoin, iif, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { PanelPageState, PanelState, PaneState } from "../models/state.models";
import { AttributeSerializerService } from "attributes";
import { PanelPageForm, PanelPageFormPane, PanelPageFormPanel } from "../models/form.models";
import { Pane, Panel, PanelPage } from "../models/panels.models";

@Injectable({
  providedIn: 'root'
})
export class FormStateConverterService {
  constructor(
    private attributeSerializer: AttributeSerializerService
  ) {}
  convertPageToForm(pp: PanelPageState, pp2: PanelPage): Observable<PanelPageForm> {
    return of(new PanelPageState()).pipe(
      switchMap(() => forkJoin(
        pp.panels.map((p, index) => this.convertPanelToForm(p, pp2.panels[index]))
      )),
      map(panels => new PanelPageForm({ id: pp.id, panels, name: pp2.name, title: pp2.title, derivativeId: '' }))
    );
  }
  convertPanelToForm(panel: PanelState, panel2: Panel): Observable<PanelPageFormPanel> {
    return of(new PanelPageFormPanel()).pipe(
      switchMap(() => forkJoin(
        panel.panes.map((p, index) => this.convertPaneToForm(p, panel2.panes[index]))
      )),
      map(panes => new PanelPageFormPanel({ panes, name: panel2.name, label: panel2.label }))
    );
  }
  convertPaneToForm(pane: PaneState, pane2: Pane): Observable<PanelPageFormPane> {
    const value = pane.state.attributes.find(a => a.name === 'value');
    return of(new PanelPageFormPane({ settings: value ? [value] : [], name: pane2.name, label: pane2.label, contentPlugin: pane2.contentPlugin })).pipe(
      switchMap(form => iif(
        () => this.hasNestedPanelPage(pane),
        pane.nestedPage ? this.convertPageToForm(pane.nestedPage, new PanelPage(this.attributeSerializer.deserializeAsObject(pane2.settings))).pipe(
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