import { Component, forwardRef, Input } from '@angular/core';
import { AbstractControl, ControlValueAccessor, UntypedFormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { ParamPluginManager } from '../../services/param-plugin-manager.service';
import { Param } from '../../models/param.models';
import { debounceTime, delay, filter, map, skipUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'classifieds-ui-params-form',
  styleUrls: ['./params-form.component.scss'],
  templateUrl: `./params-form.component.html`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ParamsFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ParamsFormComponent),
      multi: true
    },
  ]
})
export class ParamsFormComponent implements ControlValueAccessor, Validator {

  @Input()
  contexts: Array<string> = [];

  @Input()
  set params(params: any) {
    this.params$.next(params);
  }

  @Input()
  set paramValues(paramValues: Array<Param>) {
    this.paramValues$.next(paramValues);
  }

  private readonly params$ = new BehaviorSubject<any>({});
  private readonly paramValues$ = new BehaviorSubject<Array<Param>>([]);
  private readonly init$ = new Subject();
  readonly formArray = this.fb.array([]);
  readonly paramPlugins$ = this.ppm.getPlugins();
  private flags = new Map<string, string>();
  private readonly savedParams = new Map<string, Param>();
  private readonly paramIndexes = new Map<string, number>();

  private readonly paramsSub = this.params$.pipe(
    tap(params => {
      const previousIndexes = new Map<string, number>([ ...this.paramIndexes ]);
      this.formArray.clear();
      this.paramIndexes.clear();
      let index = 0;
      for(const param in params) {
        if(Array.isArray(params[param])) {
          params[param].forEach(p => this.buildParams(p, index, previousIndexes));
          index++;
        } else if(params[param].indexOf(':') === 0) {
          this.buildParams(params[param], index, previousIndexes);
          index++;
        }
      }
    })
  ).subscribe();

  private readonly savedParamsSub = this.formArray.valueChanges.pipe(
    debounceTime(1000),
    tap(values => {
      const len = values.length;
      for (let i = 0; i < len; i++) {
        this.savedParams.set(this.paramName(i), new Param(values[i]));
      }
    })
  ).subscribe();

  private readonly paramValuesSub = combineLatest([
    this.paramValues$,
    this.params$,
    this.init$
  ]).pipe(
    tap(([paramValues]) => {
      const len = paramValues ? paramValues.length : 0;
      for (let i = 0; i < len; i++) {
        const paramItem = Array.from(this.paramIndexes).find(([_, v]) => v === i);
        if (paramItem !== undefined) {
          this.savedParams.set(paramItem[0], paramValues[i]);
        }
      }
    })
  ).subscribe();

  public onTouched: () => void = () => {};

  get flagsAsArray(): Array<string> {
    const flags = [];
    this.flags.forEach((f, k) => {
      flags.push(k);
    });
    return flags;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private ppm: ParamPluginManager
  ) {
    this.flags.set('page', 'Page');
    this.flags.set('limit', 'Limit');
    this.flags.set('offset', 'Offset');
    this.flags.set('searchString', 'Search String');
  }

  ngOnInit() {
    this.init$.next(undefined);
  }

  writeValue(val: any): void {
    if (val) {
      this.formArray.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.formArray.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.formArray.disable()
    } else {
      this.formArray.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.formArray.valid ? null : this.formArray.errors;
  }

  buildParams(param: string, index: number, previousIndexes: Map<string,number>) {
    console.log(`build param ${param}`);
    this.paramIndexes.set(param, index);
    this.formArray.push(this.fb.group({
      mapping: this.fb.group({
        type: this.fb.control('', Validators.required),
        value: this.fb.control('', Validators.required),
        testValue: this.fb.control(''),
        context: this.fb.control('')
      }),
      flags: this.fb.array(this.flagsAsArray.map(k => this.fb.group({
        name: k,
        enabled: this.fb.control(false)
      })))
    }));
    if(this.savedParams.has(param)) {
      this.formArray.at(index).setValue(this.savedParams.get(param));
    } else if (index < this.paramValues$.value.length && Array.from(previousIndexes).findIndex(([_, v]) =>  v === index) === -1) {
      this.formArray.at(index).setValue(this.paramValues$.value[index]);
    }
  }

  paramName(index: number) {
    let i = 0;
    for(const param in this.params$.value) {
      if(Array.isArray(this.params$.value[param])) {
        for(let j = 0; j < this.params$.value[param].length; j++) {
          if(index === i) {
            return this.params$.value[param][j];
          }
          i++;
        }
      } else if(this.params$.value[param].indexOf(':') === 0) {
        if(i === index) {
          return this.params$.value[param];
        }
        i++;
      }
    }
  }

}