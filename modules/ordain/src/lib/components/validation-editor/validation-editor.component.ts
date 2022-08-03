import { AfterViewInit, Component, forwardRef, Input } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { FormValidation } from '../../models/validation.models';
import { tap, delay, filter, map} from 'rxjs/operators';

@Component({
  selector: 'druid-ordain-validation-editor',
  templateUrl: './validation-editor.component.html',
  styleUrls: ['./validation-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ValidationEditorComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ValidationEditorComponent),
      multi: true
    },
  ]
})
export class ValidationEditorComponent implements ControlValueAccessor, Validator, AfterViewInit {

  @Input() set validation(v: FormValidation) {
    this.validation$.next(v);
  }

  readonly formGroup = this.fb.group({
    validators: this.fb.array([])
  });

  readonly addValidator$ = new Subject();
  readonly deleteValidator$ = new Subject<number>();
  readonly afterViewInit$ = new Subject();
  readonly validation$ = new BehaviorSubject<FormValidation>(new FormValidation({ validators: [] }));

  readonly addValidatorSub = this.addValidator$.pipe(
    tap(() => {
      this.validators.push(this.fb.control(''));
    })
  ).subscribe();

  readonly deleteValidatorSub = this.deleteValidator$.pipe(
    tap(index => {
      this.validation$.value.validators.splice(index, 1);
      this.validators.removeAt(index);
    })
  ).subscribe();

  readonly validationSub = combineLatest([
    this.validation$,
    this.afterViewInit$
  ]).pipe(
    map(([v]) => v),
    filter(validation => validation.validators.length !== 0),
    tap(validation => {
      this.validators.clear();
      validation.validators.forEach((v, i) => {
        this.validators.push(this.fb.control(''));
      });
    })
  ).subscribe();

  get validators(): FormArray {
    return this.formGroup.get('validators') as FormArray;
  }

  public onTouched: () => void = () => {};
  
  constructor(
    private fb: FormBuilder
  ) {}

  ngAfterViewInit(): void {
    this.afterViewInit$.next(undefined);
    this.afterViewInit$.complete();
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