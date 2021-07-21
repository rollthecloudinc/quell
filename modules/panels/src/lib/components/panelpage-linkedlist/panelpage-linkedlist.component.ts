import { Component, Input, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { PanelContentHandler } from "../../handlers/panel-content.handler";
import { BehaviorSubject, iif, of } from "rxjs";
import { filter, map, switchMap } from "rxjs/operators";
import { Pane, Panel, PanelPage } from "../../models/panels.models";

@Component({
  selector: 'druid-panels-panelpage-linkedlist',
  templateUrl: './panelpage-linkedlist.component.html'
})
export class PanelPageLinkedlistComponent {
  
  @Input() set panelPages(panelPages: Array<PanelPage>) {
    this.panelPages$.next(panelPages);
  }

  panelPages$ = new BehaviorSubject<Array<PanelPage>>([]);
  panels$ = new BehaviorSubject<Array<Panel>>([]);
  panes$ = new BehaviorSubject<Array<Pane>>([]);

  formGroup = this.fb.group({
    panelPage: this.fb.control(''),
    panel: this.fb.control(''),
    pane: this.fb.control(''),
    nested: this.fb.control('')
  });

  panelPageSub = this.formGroup.get('panelPage').valueChanges.subscribe(index => {
    this.panels$.next(new PanelPage(this.panelPages$.value[index]).panels);
  });

  panelSub = this.formGroup.get('panel').valueChanges.subscribe(index => {
    this.panes$.next(new Panel( this.panels$.value[index] ).panes);
  });

  paneSub = this.formGroup.get('pane').valueChanges.pipe(
    map(index => this.panes$.value[index]),
    switchMap(pane => iif(
      () => pane.contentPlugin === 'panel',
      this.panelHandler.toObject(pane.settings),
      of(undefined)
    )),
    filter(p => !!p)
  ).subscribe(panelPage => {
    this.panelPages$.next([ ...this.panelPages$.value, panelPage ]);
  });

  get panels(): Array<Panel> {
    return this.panels$.value && Array.isArray(this.panels$.value) ? this.panels$.value : [];
  }

  get panes(): Array<Pane> {
    return this.panes$.value && Array.isArray(this.panes$.value) ? this.panes$.value : [];
  }

  get nested(): Array<PanelPage> {
    return this.panelPages$.value && typeof(this.panelPages$.value) !== undefined && this.panelPages$.value.length > 1 ? [ this.panelPages$.value[1] ] : undefined;
  }
  
  constructor(
    private fb: FormBuilder,
    private panelHandler: PanelContentHandler
  ) {}

}