import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { AttributeSerializerService, AttributeValue } from '@ng-druid/attributes';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormDatasource } from 'panels';

@Component({
  selector: 'classifieds-ui-form-datasource-form',
  templateUrl: './form-datasource-form.component.html',
  styleUrls: ['./form-datasource-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormDatasourceFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormDatasourceFormComponent),
      multi: true
    },
  ]
})
export class FormDatasourceFormComponent implements OnInit, ControlValueAccessor, Validator {

  @Input() set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  settings$ = new BehaviorSubject<Array<AttributeValue>>(undefined);

  formGroup = this.fb.group({
    name: this.fb.control('', [ Validators.required ]),
    field: this.fb.control('', [ Validators.required ])
  });

  settingsSub = this.settings$.pipe(
    map(s => s ? new FormDatasource(this.attributeSerializer.deserializeAsObject(s)) : undefined)
  ).subscribe(ds => {
    if (ds) {
      this.formGroup.get('name').setValue(ds.name);
      this.formGroup.get('field').setValue(ds.field);
    } else {
      this.formGroup.get('name').setValue('');
      this.formGroup.get('field').setValue('');
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
