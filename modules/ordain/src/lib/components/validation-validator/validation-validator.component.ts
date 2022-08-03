import { AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, forwardRef, Input, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from "@angular/forms";
import { AttributeValue } from "@rollthecloudinc/attributes";
import { BehaviorSubject, combineLatest, of, Subject } from "rxjs";
import { tap, switchMap, filter, map } from 'rxjs/operators';
import { ValidationRendererHostDirective } from "../../directives/validation-renderer-host.directive";
import { ValidationPlugin, ValidationValidator, ValidationValidatorSettings } from "../../models/validation.models";
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
export class ValidationValidatorComponent implements ControlValueAccessor, Validator, AfterViewInit, OnInit {

  @ViewChild(ValidationRendererHostDirective, { static: true }) validationHost: ValidationRendererHostDirective;

  @Input() contexts: Array<string> = [];

  @Input() set validation(v: ValidationValidator) {
    this.validation$.next(v);
  }

  settings$ = new BehaviorSubject<ValidationValidatorSettings>(undefined);

  readonly formGroup = this.fb.group({
    name: this.fb.control('', [ Validators.required ]),
    validator: this.fb.control('', [ Validators.required ]),
    overrideErrorMessage: this.fb.control(''),
    paramSettings: this.fb.control('')
  });

  readonly validationPlugins$ = this.vpm.getPlugins();
  componentRef$ = new BehaviorSubject<ComponentRef<any>>(undefined);
  readonly afterViewInit$ = new Subject();
  readonly onInit$ = new Subject();
  readonly validation$ = new BehaviorSubject<ValidationValidator>(undefined);

  readonly validatorChangeSub = this.formGroup.get('validator').valueChanges.pipe(
    tap(v => {
      console.log('validator change', v);
    })
  ).subscribe();

  readonly validatorSub = combineLatest([
    this.formGroup.get('validator').valueChanges,
    this.afterViewInit$
  ]).pipe(
    map(([v]) => v),
    switchMap(v => v && v !== '' ? this.vpm.getPlugin(v) : of(undefined)),
    tap(v => {
      if (v) {
        this.renderValidation(v)
      }
    })
  ).subscribe();

  readonly validationSub = this.validation$.pipe(
    tap(v => {
      if (v) {
        this.formGroup.get('name').setValue(v.name);
        this.formGroup.get('validator').setValue(v.validator);
        this.formGroup.get('overrideErrorMessage').setValue(v.overrideErrorMessage);
        setTimeout(() => this.formGroup.get('paramSettings').setValue(v.paramSettings));
      } else {
        this.formGroup.get('name').setValue('');
        this.formGroup.get('overrideErrorMessage').setValue('');
        this.formGroup.get('validator').setValue('');
      }
    }),
  ).subscribe();

  /*validationSub = this.validation$.pipe(
    tap(v => {
      setTimeout(() => this.settings$.next(v && v.settings ? v.settings : undefined));
    })
  ).subscribe(v => {
    if (v) {
      this.formGroup.get('name').setValue(v.name);
      this.formGroup.get('validator').setValue(v.validator);
    } else {
      this.formGroup.get('name').setValue('');
      this.formGroup.get('validator').setValue('');
    }
  });*/

  contextForwardingSub = this.componentRef$.pipe(
    filter(componentRef => !!componentRef)
  ).subscribe(componentRef => {
    (componentRef.instance as any).contexts = this.contexts;
    (componentRef.instance as any).settings = this.validation$.value ? this.validation$.value.paramSettings : undefined;
  });

  public onTouched: () => void = () => {};
  
  constructor(
    private fb: FormBuilder,
    private vpm: ValidationPluginManager,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit() {
    this.onInit$.next(undefined);
    this.onInit$.complete();
  }

  ngAfterViewInit() {
    this.afterViewInit$.next(undefined);
    this.afterViewInit$.complete();
  }

  writeValue(val: any): void {
    if (val) {
      this.formGroup.setValue({ ...val, settings: val.settings ? val.settings : '' }, { emitEvent: false });
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

  renderValidation(plugin: ValidationPlugin<string>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(plugin.editor);

    const viewContainerRef = this.validationHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef$.next(viewContainerRef.createComponent(componentFactory));
  }

}