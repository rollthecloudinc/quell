import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormArray, UntypedFormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { PanelContentHandler } from "../../handlers/panel-content.handler";
import { BehaviorSubject, iif, of } from "rxjs";
import { filter, map, switchMap } from "rxjs/operators";
import { Pane, Panel, PanelPage } from "../../models/panels.models";

@Component({
    selector: 'druid-panels-panelpage-linkedlist',
    templateUrl: './panelpage-linkedlist.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PanelPageLinkedlistComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => PanelPageLinkedlistComponent),
            multi: true
        },
    ],
    standalone: false
})
export class PanelPageLinkedlistComponent implements ControlValueAccessor, Validator {

  @Input() set panelPages(panelPages: Array<PanelPage>) {
    this.panelPages$.next(panelPages);
  }

  @Input() set panels(panels: Array<Panel>) {
    this.panels$.next(panels);
  }

  @Input() set panes(panes: Array<Pane>) {
    this.panes$.next(panes);
  }

  panelPages$ = new BehaviorSubject<Array<PanelPage>>([]);
  panels$ = new BehaviorSubject<Array<Panel>>([]);
  panes$ = new BehaviorSubject<Array<Pane>>([]);
  nested$ = new BehaviorSubject<Array<PanelPage>>([]);

  formGroup = this.fb.group({
    panelPage: this.fb.control(undefined),
    panel: this.fb.control(undefined),
    pane: this.fb.control(undefined),
    nested: this.fb.control(undefined)
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
    this.nested$.next([ panelPage ]);
  });

  public onTouched: () => void = () => {};

  get panelPages(): Array<PanelPage> {
    return this.panelPages$.value && Array.isArray(this.panelPages$.value) ? this.panelPages$.value : [];
  }

  get panels(): Array<Panel> {
    return this.panels$.value && Array.isArray(this.panels$.value) ? this.panels$.value : [];
  }

  get panes(): Array<Pane> {
    return this.panes$.value && Array.isArray(this.panes$.value) ? this.panes$.value : [];
  }

  get nested(): Array<PanelPage> {
    return this.nested$.value && typeof(this.nested$.value) !== undefined && this.nested$.value.length > 0 ? [ ...this.nested$.value ] : undefined;
  }
  
  constructor(
    private fb: UntypedFormBuilder,
    private panelHandler: PanelContentHandler
  ) {}

  writeValue(val: any): void {
    if (val) {
      this.formGroup.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.formGroup.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.formGroup.disable()
    } else {
      this.formGroup.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.formGroup.valid ? null : { invalidForm: { valid: false }};
  }

}