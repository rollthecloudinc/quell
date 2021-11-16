import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'classifieds-ui-datasource-source-form',
  templateUrl: './datasource-source-form.component.html',
  styleUrls: ['./datasource-source-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatasourceSourceFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatasourceSourceFormComponent),
      multi: true
    },
  ]
})
export class DatasourceSourceFormComponent implements OnInit, ControlValueAccessor, Validator {

  @Input() set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  settings$ = new BehaviorSubject<Array<AttributeValue>>(undefined);

  formGroup = this.fb.group({
    data: this.fb.control('')
  });

  settingsSub = this.settings$.pipe(
    map(s => s ? this.attributeSerializer.deserializeAsObject(s) : undefined)
  ).subscribe(ds => {
    if (ds && ds.data) {
      // this.formGroup.get('data').setValue(ds.data);
    } else {
      // this.formGroup.get('data').setValue('');
    }
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
    return this.formGroup.valid ? null : { invalidForm: {valid: false, message: "content is invalid"}};
  }

}