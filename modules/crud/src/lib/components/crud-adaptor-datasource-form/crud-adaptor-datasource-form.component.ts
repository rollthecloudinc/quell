import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, UntypedFormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { Param } from '@rollthecloudinc/dparam';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, delay, filter, map, tap } from 'rxjs/operators';
import * as qs from 'qs';
import { CrudAdaptorDatasource } from '../../models/crud.models';

@Component({
  selector: 'classifieds-ui-crud-adaptor-datasource-form',
  templateUrl: './crud-adaptor-datasource-form.component.html',
  styleUrls: ['./crud-adaptor-datasource-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CrudAdaptorDatasourceFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CrudAdaptorDatasourceFormComponent),
      multi: true
    },
  ]
})
export class CrudAdaptorDatasourceFormComponent implements OnInit, ControlValueAccessor, Validator {

  @Input()
  contexts: Array<string> = [];

  @Input() set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  optionsParsed: any;
  paramsParsed: any;

  settings$ = new BehaviorSubject<Array<AttributeValue>>(undefined);
  readonly datasource$ = new BehaviorSubject<CrudAdaptorDatasource>(undefined);
  readonly optionValues$ = new BehaviorSubject<Array<Param>>([]);
  readonly paramValues$ = new BehaviorSubject<Array<Param>>([]);

  formGroup = this.fb.group({
    adaptorName: this.fb.control(''),
    optionsString: this.fb.control(''),
    paramsString: this.fb.control(''),
    options: this.fb.control([]),
    params: this.fb.control([])
  });

  settingsSub = this.settings$.pipe(
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
  });

  private readonly datasourceOptionsSub = combineLatest([
    this.datasource$,
    this.formGroup.get('optionsString').valueChanges
  ]).pipe(
    filter(([ds]) => ds !== undefined),
    delay(1),
    tap(([ds]) => this.optionValues$.next(ds.options))
  ).subscribe();

  private readonly datasourceParamsSub = combineLatest([
    this.datasource$,
    this.formGroup.get('paramsString').valueChanges
  ]).pipe(
    filter(([ds]) => ds !== undefined),
    delay(1),
    tap(([ds]) => this.paramValues$.next(ds.params))
  ).subscribe();

  private readonly optionsStringChangeSub = this.formGroup.get('optionsString').valueChanges.pipe(
    debounceTime(500)
  ).subscribe(optionsString => {
    const parsed = qs.parse('?' + optionsString);
    this.optionsParsed = parsed;
  });

  private readonly paramsStringChangeSub = this.formGroup.get('paramsString').valueChanges.pipe(
    debounceTime(500)
  ).subscribe(paramsString => {
    const parsed = qs.parse('?' + paramsString);
    this.paramsParsed = parsed;
  });

  public onTouched: () => void = () => {};

  constructor(
    private fb: UntypedFormBuilder,
    private attributeSerializer: AttributeSerializerService
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