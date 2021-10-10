import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ContextDatasource, InlineContext } from '../../models/context.models';

@Component({
  selector: 'classifieds-ui-context-datasource-form',
  templateUrl: './context-datasource-form.component.html',
  styleUrls: ['./context-datasource-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContextDatasourceFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ContextDatasourceFormComponent),
      multi: true
    },
  ]
})
export class ContextDatasourceFormComponent implements ControlValueAccessor, Validator {

  @Input() contexts: Array<string> = [];
  @Input() set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  settings$ = new BehaviorSubject<Array<AttributeValue>>(undefined);

  formGroup = this.fb.group({
    name: this.fb.control('', [ Validators.required ])
  });

  settingsSub = this.settings$.pipe(
    map(s => s ? new ContextDatasource(this.attributeSerializer.deserializeAsObject(s)) : undefined)
  ).subscribe(ds => {
    if (ds) {
      this.formGroup.get('name').setValue(ds.name);
    } else {
      this.formGroup.get('name').setValue('');
    }
  });

  public onTouched: () => void = () => {};

  constructor(
    private fb: FormBuilder,
    private attributeSerializer: AttributeSerializerService
  ) {}

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
