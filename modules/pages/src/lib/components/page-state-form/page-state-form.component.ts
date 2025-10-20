import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlContainer, FormGroup, UntypedFormBuilder, Validators, NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, ValidationErrors } from '@angular/forms';
import { InlineContext } from '@rollthecloudinc/context';
import { PanelPage, PanelPageSelector } from '@rollthecloudinc/panels';
import { BehaviorSubject, pipe } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

@Component({
    selector: 'classifieds-ui-page-state-form',
    //templateUrl: './context-editor.component.html',
    styleUrls: ['./page-state-form.component.scss'],
    templateUrl: './page-state-form.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PageStateFormComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => PageStateFormComponent),
            multi: true
        },
    ]
    // template: `<ng-container [formGroup]="controlContainer.control"><classifieds-ui-rest-source-form formControlName="rest"></classifieds-ui-rest-source-form></ng-container>`
    ,
    standalone: false
})
export class PageStateFormComponent implements OnInit, ControlValueAccessor {

  @Input()
  set panelPage(pp: PanelPage) {
    this.panelPage$.next(pp);
  }

  @Input() 
  set context(context: InlineContext) {
    this.context$.next(context);
  }

  panelPages: Array<PanelPage> = [];
  panelPage$ = new BehaviorSubject<PanelPage>(new PanelPage());
  context$ = new BehaviorSubject<InlineContext>(undefined);
  formGroup = this.fb.group({
    // selectionPath: this.fb.control([]),
    state: this.fb.control('', [ Validators.required ]),
    /*type: this.fb.control('', [ ]),
    defaultValue: this.fb.control(''),*/
  });

  stateCtrl = this.fb.control('');
  /*selectionPathCtrl = this.fb.control('');

  selectionPathCtrlSub = this.selectionPathCtrl.valueChanges.pipe(
    map(v => v && v !== '' ? this.flattenSelector(v) : [])
  ).subscribe(v => {
    this.formGroup.get('selectionPath').setValue(v);
  });*/
  stateCtrlSub = this.stateCtrl.valueChanges.pipe(
    debounceTime(250),
    distinctUntilChanged(),
    filter(v => {
      try {
        JSON.parse(v)
        return true;
      } catch(e) {
        return false;
      }
    }),
    map(v => JSON.parse(v))
  ).subscribe(v => {
    console.log('write state');
    console.log(v);
    this.formGroup.get('state').setValue(v);
  });

  public onTouched: () => void = () => {};

  constructor(private fb: UntypedFormBuilder, public controlContainer: ControlContainer) { }

  ngOnInit(): void {
    this.panelPage$.subscribe(pp => {
      this.panelPages = [pp];
    });
    this.context$.subscribe(c => {
      if (c) {
        this.stateCtrl.setValue(JSON.stringify(c.data.state));
        // this.formGroup.get('selectionPath').setValue(c.data.selectionPath);
        // @todo: reselect path
      } else {
        this.stateCtrl.setValue('');
        // this.formGroup.get('selectionPath').setValue([]);
      }
    });
  }

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
    if (isDisabled) {
      this.formGroup.disable()
    } else {
      this.formGroup.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.formGroup.valid ? null : { invalidForm: {valid: false, message: "source is invalid"}};
  }

  flattenSelector(selector: PanelPageSelector): Array<number> {
    const flat: Array<number> = [];
    if (selector.panel !== undefined && selector.panel !== null) {
      flat.push(selector.panel);
    }
    if (selector.pane !== undefined && selector.pane !== null) {
      flat.push(selector.pane);
    }
    if (selector.nested !== undefined && selector.nested !== null && typeof(selector.nested) === 'object') {
      this.flattenSelector(selector.nested).forEach(i => flat.push(i));
    }
    return flat;
  }


}
