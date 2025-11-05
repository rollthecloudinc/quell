import { Component, forwardRef, Input } from '@angular/core';
import { AbstractControl, ControlValueAccessor, UntypedFormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { ParamPluginManager } from '../../services/param-plugin-manager.service';
import { Param } from '../../models/param.models';
import { debounceTime, filter, take, tap } from 'rxjs/operators';

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
    ],
    standalone: false
})
export class ParamsFormComponent implements ControlValueAccessor, Validator {

  @Input()
  contexts: Array<string> = [];

  @Input()
  set params(params: any) {
    console.log('Input "params" set:', params);
    // Always emit the new value to the params$ BehaviorSubject
    this.params$.next(params);
  }

  @Input()
  set paramValues(paramValues: Array<Param>) {
    console.log('Input "paramValues" set:', paramValues);
    // Set default value as an empty array if data is not provided
    this.paramValues$.next(paramValues || []);
  }

  // Reactive Subjects
  private readonly params$ = new BehaviorSubject<any>({});
  private readonly paramValues$ = new BehaviorSubject<Array<Param>>([]);
  private readonly init$ = new Subject();

  // Reactive Forms
  readonly formArray = this.fb.array([]);
  readonly paramPlugins$ = this.ppm.getPlugins();
  private flags = new Map<string, string>();
  private readonly savedParams = new Map<string, Param>();
  private readonly paramIndexes = new Map<string, number>();

  constructor(
    private fb: UntypedFormBuilder,
    private ppm: ParamPluginManager
  ) {
    // Initialize default flags
    this.flags.set('page', 'Page');
    this.flags.set('limit', 'Limit');
    this.flags.set('offset', 'Offset');
    this.flags.set('searchString', 'Search String');

    // Bind to combined observables for syncing logic
    combineLatest([this.params$, this.paramValues$, this.init$]).pipe(
      filter(([params, paramValues]) => !!params && !!paramValues), // Wait until both values are present
      tap(([params, paramValues]) => {
        console.log('params$ emitted value:', params);
        console.log('paramValues$.value (current):', paramValues);

        const previousIndexes = new Map(this.paramIndexes); // Clone the previous indexes
        this.formArray.clear();
        this.paramIndexes.clear();

        let index = 0;
        for (const param in params) {
          console.log('Processing param:', param);
          if (Array.isArray(params[param])) {
            params[param].forEach((p) => this.buildParams(p, index++, previousIndexes));
          } else if (params[param].indexOf(':') === 0) {
            this.buildParams(params[param], index++, previousIndexes);
          }
        }
      })
    ).subscribe();
  }

  ngOnInit() {
    // Emit an initial value to start the combineLatest logic
    this.init$.next(undefined);
  }

  // ControlValueAccessor methods
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
      this.formArray.disable();
    } else {
      this.formArray.enable();
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return this.formArray.valid ? null : this.formArray.errors;
  }

  // Build the form fields for given parameters
  buildParams(param: string, index: number, previousIndexes: Map<string, number>) {
    console.log(`Building param: ${param}, index: ${index}`);

    this.paramIndexes.set(param, index);

    // Construct the form group for the current param
    const formGroup = this.fb.group({
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
    });

    this.formArray.push(formGroup);

    if (this.savedParams.has(param)) {
      // Use saved params to populate the form if available
      formGroup.setValue(this.savedParams.get(param));
    } else if (index < this.paramValues$.value.length) {
      const previousIndex = Array.from(previousIndexes).findIndex(([_, v]) => v === index);
      if (previousIndex === -1) {
        // Use paramValues to initialize the form if no saved params exist
        formGroup.setValue(this.paramValues$.value[index]);
      }
    }
  }

  // Retrieve a parameter name by its index
  paramName(index: number): string | undefined {
    let i = 0;
    for (const param in this.params$.value) {
      if (Array.isArray(this.params$.value[param])) {
        for (let j = 0; j < this.params$.value[param].length; j++) {
          if (index === i) {
            return this.params$.value[param][j];
          }
          i++;
        }
      } else if (this.params$.value[param].indexOf(':') === 0) {
        if (i === index) {
          return this.params$.value[param];
        }
        i++;
      }
    }
    return undefined;
  }

  get flagsAsArray(): Array<string> {
    return Array.from(this.flags.keys());
  }

  // Handle touched event for form
  public onTouched: () => void = () => {};
}