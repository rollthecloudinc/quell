import { Component, forwardRef, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

@Component({
  selector: 'classifieds-ui-data-source-form',
  templateUrl: './data-source-form.component.html',
  styleUrls: ['./data-source-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DataSourceFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DataSourceFormComponent),
      multi: true
    },
  ]
})
export class DataSourceFormComponent implements OnInit, ControlValueAccessor, Validator {

  formGroup = this.fb.group({
    data: this.fb.control('')
  });

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
    return this.formGroup.valid ? null : { invalidForm: {valid: false, message: "content is invalid"}};
  }

}