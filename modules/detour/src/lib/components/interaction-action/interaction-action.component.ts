import { Component, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";

@Component({
  selector: 'druid-detour-interaction-action',
  templateUrl: './interaction-action.component.html',
  styleUrls: ['./interaction-action.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InteractionActionComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InteractionActionComponent),
      multi: true
    },
  ]
})
export class InteractionActionComponent implements ControlValueAccessor, Validator {

  readonly actionForm = this.fb.group({
    action: this.fb.control('')
  });

  public onTouched: () => void = () => {};

  constructor(
    private fb: FormBuilder
  ) {
  }

  writeValue(val: any): void {
    if (val) {
      this.actionForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.actionForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.actionForm.disable()
    } else {
      this.actionForm.enable()
    }
  }
  validate(c: AbstractControl): ValidationErrors | null{
    return this.actionForm.valid ? null : this.actionForm.errors;
  }
}