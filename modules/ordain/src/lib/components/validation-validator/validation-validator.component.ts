import { AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, forwardRef, Input, ViewChild } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from "@angular/forms";
import { BehaviorSubject, combineLatest, of, Subject } from "rxjs";
import { tap, switchMap, filter, map } from 'rxjs/operators';
import { ValidationRendererHostDirective } from "../../directives/validation-renderer-host.directive";
import { ValidationPlugin } from "../../models/validation.models";
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
export class ValidationValidatorComponent implements ControlValueAccessor, Validator, AfterViewInit {

  @ViewChild(ValidationRendererHostDirective, { static: true }) validationHost: ValidationRendererHostDirective;

  @Input() contexts: Array<string> = [];

  readonly formGroup = this.fb.group({
    name: this.fb.control('', [ Validators.required ]),
    validator: this.fb.control('', [ Validators.required ]),
    settings: this.fb.control('')
  });

  readonly validationPlugins$ = this.vpm.getPlugins();
  componentRef$ = new BehaviorSubject<ComponentRef<any>>(undefined);
  readonly afterViewInit$ = new Subject();

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

  contextForwardingSub = this.componentRef$.pipe(
    filter(componentRef => !!componentRef)
  ).subscribe(componentRef => {
    (componentRef.instance as any).contexts = this.contexts;
    // (componentRef.instance as any).settings = this.settings$.value;
  });

  public onTouched: () => void = () => {};
  
  constructor(
    private fb: FormBuilder,
    private vpm: ValidationPluginManager,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

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