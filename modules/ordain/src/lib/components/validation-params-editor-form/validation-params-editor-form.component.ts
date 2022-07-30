import { Component, forwardRef, Input } from "@angular/core";
import { AbstractControl, ControlContainer, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { AttributeValue } from "@rollthecloudinc/attributes";
import { Param } from '@rollthecloudinc/dparam';
import { BehaviorSubject } from "rxjs";
import { debounceTime } from 'rxjs/operators';
import * as qs from 'qs';

@Component({
  selector: 'druid-ordain-validation-params-editor-form',
  templateUrl: './validation-params-editor-form.component.html',
  styleUrls: ['./validation-params-editor-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ValidationParamsEditorFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ValidationParamsEditorFormComponent),
      multi: true
    },
  ]
})
export class ValidationParamsEditorFormComponent implements ControlValueAccessor, Validator {

  @Input()
  contexts: Array<string> = [];

  @Input() set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  paramsParsed: any;

  settings$ = new BehaviorSubject<Array<AttributeValue>>(undefined);
  //readonly datasource$ = new BehaviorSubject<CrudAdaptorDatasource>(undefined);
  readonly paramValues$ = new BehaviorSubject<Array<Param>>([]);

  formGroup = this.fb.group({
    paramsString: this.fb.control(''),
    params: this.fb.control([])
  });

  private readonly paramsStringChangeSub = this.formGroup.get('paramsString').valueChanges.pipe(
    debounceTime(500)
  ).subscribe(paramsString => {
    const parsed = qs.parse('?' + paramsString);
    this.paramsParsed = parsed;
  });

  public onTouched: () => void = () => {};

  constructor(
    private fb: FormBuilder
  ) {

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

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.formGroup.disable()
    } else {
      this.formGroup.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.formGroup.valid ? null : this.formGroup.errors;
  }

}