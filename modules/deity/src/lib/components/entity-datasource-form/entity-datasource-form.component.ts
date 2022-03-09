import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { AttributeSerializerService, AttributeValue } from '@ng-druid/attributes';
import { Param } from 'dparam';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import * as qs from 'qs'

@Component({
  selector: 'classifieds-ui-entity-datasource-form',
  templateUrl: './entity-datasource-form.component.html',
  styleUrls: ['./entity-datasource-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EntityDataSourceFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EntityDataSourceFormComponent),
      multi: true
    },
  ]
})
export class EntityDataSourceFormComponent implements OnInit, ControlValueAccessor, Validator {

  @Input()
  contexts: Array<string> = [];

  @Input() set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  paramsParsed: any;

  settings$ = new BehaviorSubject<Array<AttributeValue>>(undefined);
  readonly paramValues$ = new BehaviorSubject<Array<Param>>([]);

  formGroup = this.fb.group({
    entityName: this.fb.control(''),
    queryString: this.fb.control(''),
    params: this.fb.control([])
  });

  settingsSub = this.settings$.pipe(
    map(s => s ? this.attributeSerializer.deserializeAsObject(s) : undefined)
  ).subscribe(ds => {
    if (ds) {
      this.formGroup.get('entityName').setValue(ds.entityName);
      this.formGroup.get('queryString').setValue(ds.queryString);
    } else {
      this.formGroup.get('entityName').setValue('');
      this.formGroup.get('queryString').setValue('');
    }
  });

  private readonly queryStringChangeSub = this.formGroup.get('queryString').valueChanges.pipe(
    debounceTime(500)
  ).subscribe(queryString => {
    const parsed = qs.parse('?' + queryString);
    this.paramsParsed = parsed;
  });

  public onTouched: () => void = () => {};

  constructor(
    private fb: FormBuilder,
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