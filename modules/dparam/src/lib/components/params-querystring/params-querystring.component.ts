import { AfterViewInit, Component, forwardRef, Input } from "@angular/core";
import { AbstractControl, ControlContainer, ControlValueAccessor, UntypedFormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { AttributeValue } from "@rollthecloudinc/attributes";
import { Param, ParamSettings } from '../../models/param.models';
import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { debounceTime, filter, tap, delay } from 'rxjs/operators';
import qs from 'qs'
// import { ValidationValidatorSettings } from "../../models/validation.models";

@Component({
    selector: 'druid-params-querystring',
    templateUrl: './params-querystring.component.html',
    styleUrls: ['./params-querystring.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ParamsQuerystringComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => ParamsQuerystringComponent),
            multi: true
        },
    ],
    standalone: false
})
export class ParamsQuerystringComponent implements ControlValueAccessor, Validator {

  @Input()
  contexts: Array<string> = [];

  @Input() set settings(settings: ParamSettings) {
    this.settings$.next(settings);
  }

  paramsParsed: any;
  settings$ = new BehaviorSubject<ParamSettings>(undefined);
  afterViewInit$ = new Subject();
  readonly paramValues$ = new BehaviorSubject<Array<Param>>([]);

  formGroup = this.fb.group({
    paramsString: this.fb.control(''),
    params: this.fb.control([])
  });

  private readonly paramsStringChangeSub = this.formGroup.get('paramsString').valueChanges.pipe(
    debounceTime(500)
  ).subscribe(paramsString => {
    const parsed = qs.parse('?' + paramsString);
    this.paramsParsed = parsed;
  });

  settingsSub = this.settings$.pipe(
    tap(s => {
      if (s) {
        this.formGroup.get('paramsString').setValue(s.paramsString ? s.paramsString : '');
      }
    })
  ).subscribe();

  private readonly settingsParamsSub = combineLatest([
    this.settings$,
    this.formGroup.get('paramsString').valueChanges
  ]).pipe(
    filter(([s]) => s !== undefined),
    delay(1),
    tap(([s]) => this.paramValues$.next(s.params))
  ).subscribe();

  public onTouched: () => void = () => {};

  constructor(
    private fb: UntypedFormBuilder
  ) {

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
    return this.formGroup.valid ? null : this.formGroup.errors;
  }

}