import { Component, forwardRef, Input } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
// import { ControlContainer } from '@angular/forms';
//import { ValidationValidatorSettings } from '../../models/validation.models';

@Component({
  selector: 'druid-detour-interaction-listener',
  templateUrl: './interaction-listener.component.html',
  styleUrls: ['./interaction-listener.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InteractionListenerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InteractionListenerComponent),
      multi: true
    },
  ]
})
export class InteractionListenerComponent implements ControlValueAccessor, Validator {
  //@Input() settings: Array<ValidationValidatorSettings> = [];
  readonly listenerForm = this.fb.group({
    event: this.fb.control(''),
    handler: this.fb.control('')
  });
  @Input() contexts: Array<string> = [];
  public onTouched: () => void = () => {};
  constructor(
    private fb: FormBuilder
  ) {}
  writeValue(val: any): void {
    if (val) {
      this.listenerForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.listenerForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.listenerForm.disable()
    } else {
      this.listenerForm.enable()
    }
  }
  validate(c: AbstractControl): ValidationErrors | null{
    return this.listenerForm.valid ? null : this.listenerForm.errors;
  }
}