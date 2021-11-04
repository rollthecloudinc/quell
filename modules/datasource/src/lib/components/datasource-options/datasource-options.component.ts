import { Component, forwardRef, Input } from '@angular/core';
import { FormBuilder, ControlValueAccessor, Validator, AbstractControl, ValidationErrors, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DatasourceOptions } from '../../models/datasource.models';
import { mockDatasourceOptions } from '../../mocks/datasource.mocks';

@Component({
  selector: 'classifieds-ui-datasource-options',
  templateUrl: './datasource-options.component.html',
  // styleUrls: ['./rest-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatasourceOptionsComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatasourceOptionsComponent),
      multi: true
    },
  ]
})
export class DatasourceOptionsComponent implements ControlValueAccessor, Validator {

  @Input() 
  set datasourceOptions(datasourceOptions: DatasourceOptions) {
    this.datasourceOptions$.next(datasourceOptions);
  }

  datasourceOptions$ = new BehaviorSubject<DatasourceOptions>(mockDatasourceOptions);

  formGroup = this.fb.group({
    query: this.fb.control(''),
    trackBy: this.fb.control(''),
    valueMapping: this.fb.control(''),
    labelMapping: this.fb.control(''),
    idMapping: this.fb.control(''),
    multiple: this.fb.control(''),
    limit: this.fb.control('')
  });

  datasourceOptionsSub = this.datasourceOptions$.subscribe(ds => {
    this.formGroup.setValue(ds);
    this.formGroup.updateValueAndValidity();
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

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.formGroup.disable()
    } else {
      this.formGroup.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.formGroup.valid ? null : { datasourceOptions: { valid: false }};
  }

}