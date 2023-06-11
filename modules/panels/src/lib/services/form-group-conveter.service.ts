import { Injectable } from "@angular/core";
import { forkJoin, iif, Observable, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { PanelPageState, PanelState, PaneState } from "../models/state.models";
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { PanelPageForm, PanelPageFormPane, PanelPageFormPanel } from "../models/form.models";
import { Pane, Panel, PanelPage } from "../models/panels.models";
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class FormGroupConverterService {
  constructor(
    private attributeSerializer: AttributeSerializerService,
    private fb: UntypedFormBuilder
  ) {}
  makeFormGroupFromPage(pp: PanelPage, pp2: PanelPageForm): Observable<UntypedFormGroup> {
    return of(this.fb.group({ /*name: this.fb.control(pp.name),*/ panels: this.fb.array([]) })).pipe(
      switchMap(pageFormGroup => forkJoin(
        pp.panels.map((p, index) => this.makeFormGroupFromPanel(p, pp2.panels[index]))
      ).pipe(
        map(panelGroups => ({ panelGroups, pageFormGroup }))
      )),
      tap(({ panelGroups, pageFormGroup }) => {
        const len = panelGroups.length;
        for (let i = 0; i < len; i++) {
          (pageFormGroup.get('panels') as UntypedFormArray).push(panelGroups[i]);
        }
      }),
      map(({ pageFormGroup }) => pageFormGroup)
    );
  }
  makeFormGroupFromPanel(panel: Panel, panel2: PanelPageFormPanel): Observable<UntypedFormGroup> {
    return of(this.fb.group({ name: this.fb.control(panel.name), panes: this.fb.array([]) })).pipe(
      switchMap(panelFormGroup => forkJoin(
        panel.panes.map((p, index) => this.makeFormGroupFromPane(p, panel2.panes[index]))
      ).pipe(
        map(paneGroups => ({ paneGroups, panelFormGroup }))
      )),
      tap(({ paneGroups, panelFormGroup }) => {
        const len = paneGroups.length;
        for (let i = 0; i < len; i++) {
          (panelFormGroup.get('panes') as UntypedFormArray).push(paneGroups[i]);
        }
      }),
      map(({ panelFormGroup }) => panelFormGroup)
    );
  }
  makeFormGroupFromPane(pane: Pane, pane2: PanelPageFormPane): Observable<UntypedFormGroup> {
    const value = pane2 ? pane2.settings.find(a => a.name === 'value') : undefined;
    return of(this.fb.group({ name: this.fb.control(pane.name), contentPlugin: this.fb.control(''), settings: this.fb.array([]) })).pipe(
      switchMap(paneFormGroup => iif(
        () => this.hasNestedPanelPage(pane),
        this.hasNestedPanelPage(pane) ? this.makeFormGroupFromPage(pane.nestedPage, new PanelPageForm(this.attributeSerializer.deserializeAsObject(pane2.settings))).pipe(
          tap(pageFormGroup => {
            const newGroup = this.attributeSerializer.convertToGroup(this.attributeSerializer.serialize(pageFormGroup.value, 'value').attributes[0]);
            paneFormGroup.get('contentPlugin').setValue('panel');
            (paneFormGroup.get('settings') as UntypedFormArray).push(newGroup);
          }),
          map(() => paneFormGroup)
        ): of(paneFormGroup).pipe(
          tap(() => {
            if (value) {
              const newGroup = this.attributeSerializer.convertToGroup(value);
              (paneFormGroup.get('settings') as UntypedFormArray).push(newGroup);
            }
          })
        ),
        of(paneFormGroup).pipe(
          tap(() => {
            if (value) {
              const newGroup = this.attributeSerializer.convertToGroup(value);
              (paneFormGroup.get('settings') as UntypedFormArray).push(newGroup);
            }
          })
        )
      ))
    );
  }
  hasNestedPanelPage(pane: Pane): boolean {
    return !!pane.nestedPage;
  }
}