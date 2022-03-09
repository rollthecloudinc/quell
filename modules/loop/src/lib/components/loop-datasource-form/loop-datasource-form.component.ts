import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { AttributeValue } from '@ng-druid/attributes';
import { BehaviorSubject } from 'rxjs';
import { LoopDatasource } from '../../models/loop.models';

@Component({
  selector: 'classifieds-ui-loop-datasource-form',
  templateUrl: './loop-datasource-form.component.html',
  styleUrls: ['./loop-datasource-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LoopDatasourceFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => LoopDatasourceFormComponent),
      multi: true
    },
  ]
})
export class LoopDatasourceFormComponent implements OnInit, ControlValueAccessor, Validator {

  @Input()
  contexts: Array<string> = [];

  @Input() set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  optionsParsed: any;
  paramsParsed: any;

  settings$ = new BehaviorSubject<Array<AttributeValue>>(undefined);
  readonly datasource$ = new BehaviorSubject<LoopDatasource>(undefined);

  formGroup = this.fb.group({
  });

  /*settingsSub = this.settings$.pipe(
    map(s => s ? new CrudAdaptorDatasource (this.attributeSerializer.deserializeAsObject(s)) : undefined),
    tap(ds => setTimeout(() => this.datasource$.next(ds)))
  ).subscribe(ds => {
    if (ds) {
      this.formGroup.get('adaptorName').setValue(ds.adaptorName);
      this.formGroup.get('optionsString').setValue(ds.optionsString ? ds.optionsString : '');
      this.formGroup.get('paramsString').setValue(ds.paramsString ? ds.paramsString : '');
    } else {
      this.formGroup.get('adaptorName').setValue('');
      this.formGroup.get('optionsString').setValue('');
      this.formGroup.get('paramsString').setValue('');
      setTimeout(() => this.optionValues$.next([]), 2);
      setTimeout(() => this.optionValues$.next([]), 2);
    }
  });*/

  public onTouched: () => void = () => {};

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit() {

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