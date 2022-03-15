import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlContainer, FormBuilder, Validators, NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, ValidationErrors } from '@angular/forms';
import { InlineContext } from '@ng-druid/context';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'classifieds-ui-context-module-form',
  //templateUrl: './context-editor.component.html',
  styleUrls: ['./context-module-form.component.scss'],
  templateUrl: './context-module-form.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContextModuleFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ContextModuleFormComponent),
      multi: true
    },
  ]
})
export class ContextModuleFormComponent implements OnInit, ControlValueAccessor {

  @Input() 
  set context(context: InlineContext) {
    this.context$.next(context);
  }

  context$ = new BehaviorSubject<InlineContext>(undefined);
  formGroup = this.fb.group({
    remoteEntry: this.fb.control('', [ Validators.required ]),
    exposedModule: this.fb.control('', [ Validators.required ])
  });

  public onTouched: () => void = () => {};

  constructor(private fb: FormBuilder, public controlContainer: ControlContainer) { }

  ngOnInit(): void {
    this.context$.subscribe(c => {
      if (c) {
        this.formGroup.setValue({
          remoteEntry: c.data.remoteEntry,
          exposedModule: c.data.exposedModule
        });
      } else {
        this.formGroup.setValue({
          remoteEntry: '',
          exposedModule: ''
        });
      }
    });
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
    return this.formGroup.valid ? null : { invalidForm: {valid: false, message: "source is invalid"}};
  }

}
