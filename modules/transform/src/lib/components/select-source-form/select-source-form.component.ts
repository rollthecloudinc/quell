import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, UntypedFormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectTransform } from '../../models/transform.models';

@Component({
  selector: 'classifieds-ui-select-source-form',
  templateUrl: './select-source-form.component.html',
  styleUrls: ['./select-source-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectSourceFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SelectSourceFormComponent),
      multi: true
    },
  ]
})
export class SelectSourceFormComponent implements OnInit, ControlValueAccessor, Validator {

  @Input() set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  settings$ = new BehaviorSubject<Array<AttributeValue>>(undefined);

  formGroup = this.fb.group({
    query: this.fb.control('', [ Validators.required ])
  });

  settingsSub = this.settings$.pipe(
    map(s => s ? new SelectTransform(this.attributeSerializer.deserializeAsObject(s)) : undefined)
  ).subscribe(ds => {
    if (ds) {
      this.formGroup.get('query').setValue(ds.query);
    } else {
      this.formGroup.get('query').setValue('');
    }
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
    return this.formGroup.valid ? null : { invalidForm: {valid: false, message: "content is invalid"}};
  }

}
