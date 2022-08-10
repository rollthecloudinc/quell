import { Component, ComponentRef, forwardRef, Input } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { BehaviorSubject } from 'rxjs';
import { Plugin } from '@rollthecloudinc/plugin';

@Component({
  selector: 'druid-params-plugin-instance',
  templateUrl: './plugin-instance.component.html',
  styleUrls: ['./plugin-instance.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PluginInstanceComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PluginInstanceComponent),
      multi: true
    },
  ]
})
export class PluginInstanceComponent implements ControlValueAccessor, Validator {

  @Input() set title(title: string) {
    this.title$.next(title);
  }

  @Input() set plugins(plugins: Array<Plugin<string>>) {
    this.plugins$.next(plugins);
  }

  readonly plugins$ = new BehaviorSubject<Array<Plugin<string>>>([]);
  readonly title$ = new BehaviorSubject<string>('');

  readonly instanceForm = this.fb.group({
    plugin: this.fb.control(''),
    settings: this.fb.control('')
  });

  public onTouched: () => void = () => {};

  constructor(
    private fb: FormBuilder
  ) {
  }

  writeValue(val: any): void {
    if (val) {
      this.instanceForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.instanceForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.instanceForm.disable()
    } else {
      this.instanceForm.enable()
    }
  }
  validate(c: AbstractControl): ValidationErrors | null{
    return this.instanceForm.valid ? null : this.instanceForm.errors;
  }

}