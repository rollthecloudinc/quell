import { Component, forwardRef, Input } from "@angular/core";
import {
  AbstractControl,
  ControlValueAccessor,
  UntypedFormBuilder,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ValidationErrors,
  Validator
} from "@angular/forms";
import { BehaviorSubject, iif, of } from "rxjs";
import { filter, map, switchMap } from "rxjs/operators";
import { Pane, Panel, PanelPage } from "../../models/panels.models";
import { PanelContentHandler } from "../../handlers/panel-content.handler";

@Component({
  selector: "druid-panels-panelpage-linkedlist",
  templateUrl: "./panelpage-linkedlist.component.html",
  standalone: false,
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
    }
  ]
})
export class PanelPageLinkedlistComponent implements ControlValueAccessor, Validator {

  @Input() set panelPages(value: Array<PanelPage>) {
    this.panelPages$.next(value ?? []);
  }

  @Input() set panels(value: Array<Panel>) {
    this.panels$.next(value ?? []);
  }

  @Input() set panes(value: Array<Pane>) {
    this.panes$.next(value ?? []);
  }

  panelPages$ = new BehaviorSubject<Array<PanelPage>>([]);
  panels$ = new BehaviorSubject<Array<Panel>>([]);
  panes$ = new BehaviorSubject<Array<Pane>>([]);
  nested$ = new BehaviorSubject<Array<PanelPage>>([]);

  formGroup = this.fb.group({
    panelPage: this.fb.control(null),
    panel: this.fb.control(null),
    pane: this.fb.control(null),
    nested: this.fb.control(null)
  });

  constructor(
    private fb: UntypedFormBuilder,
    private panelHandler: PanelContentHandler
  ) {
    this.initSubscriptions();
  }

  private initSubscriptions() {

    // PANEL PAGE SELECTION → PANELS
    this.formGroup.get("panelPage").valueChanges
      .pipe(filter(index => index !== null && index !== undefined))
      .subscribe(index => {
        const page = this.panelPages$.value[index];
        this.panels$.next(page ? new PanelPage(page).panels : []);
      });

    // PANEL SELECTION → PANES
    this.formGroup.get("panel").valueChanges
      .pipe(filter(index => index !== null && index !== undefined))
      .subscribe(index => {
        const panel = this.panels$.value[index];
        this.panes$.next(panel ? new Panel(panel).panes : []);
      });

    // PANE SELECTION → NESTED PANEL PAGE
    this.formGroup.get("pane").valueChanges
      .pipe(
        filter(index => index !== null && index !== undefined),
        map(index => {
          const pane = this.panes$.value[index];
          return pane ?? null;
        }),
        filter(pane => !!pane),   // ignore undefined
        switchMap(pane =>
          pane.contentPlugin === "panel"
            ? this.panelHandler.toObject(pane.settings)
            : of(null)
        )
      )
      .subscribe(page => {
        this.nested$.next(page ? [page] : []);
      });
  }

  onTouched = () => {};

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

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) this.formGroup.disable();
    else this.formGroup.enable();
  }

  validate(_: AbstractControl): ValidationErrors | null {
    return this.formGroup.valid ? null : { invalidForm: { valid: false } };
  }
}