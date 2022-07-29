import { Component, forwardRef } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { tap } from 'rxjs/operators';
import { ValidationPluginManager } from "../../services/validation-plugin-manager.service";

@Component({
  selector: 'druid-ordain-validation-validator',
  templateUrl: './validation-validator.component.html',
  styleUrls: ['./validation-validator.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ValidationValidatorComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ValidationValidatorComponent),
      multi: true
    },
  ]
})
export class ValidationValidatorComponent implements ControlValueAccessor, Validator {

  readonly formGroup = this.fb.group({
    name: this.fb.control('', [ Validators.required ]),
    validator: this.fb.control('', [ Validators.required ])
  });

  readonly validationPlugins$ = this.vpm.getPlugins();

  public onTouched: () => void = () => {};
  
  constructor(
    private fb: FormBuilder,
    private vpm: ValidationPluginManager
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