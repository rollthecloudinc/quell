import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, Validator, NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, ValidationErrors } from '@angular/forms';
import { LayoutPlugin } from '../../models/layout.models';
import { AttributeValue } from '@rollthecloudinc/attributes';

@Component({
  selector: 'druid-layout-form',
  templateUrl: './layout-form.component.html',
  styleUrls: ['./layout-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LayoutFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => LayoutFormComponent),
      multi: true
    },
  ]
})
export class LayoutFormComponent implements OnInit, ControlValueAccessor, Validator {

  @Input() layout: LayoutPlugin;
  @Input() type: string;
  @Input() settingValues: Array<AttributeValue> = [];

  layoutForm = this.fb.group({
    settings: this.fb.control('')
  });

  public onTouched: () => void = () => {};

  get attributes() {
    return this.layout.settings.has(this.type) ? this.layout.settings.get(this.type) : [];
  }

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  writeValue(val: any): void {
    if (val) {
      this.layoutForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.layoutForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.layoutForm.disable()
    } else {
      this.layoutForm.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.layoutForm.valid ? null : { invalidForm: {valid: false, message: "layout is invalid"}};
  }

}
