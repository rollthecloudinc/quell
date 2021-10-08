import { Component, ComponentFactoryResolver, ComponentRef, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { DatasourcePluginManager } from '../../services/datasource-plugin-manager.service';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { DatasourcePlugin } from '../../models/datasource.models';
import { DatasourceRendererHostDirective } from '../../directives/datasource-renderer-host.directive';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'classifieds-ui-datasource-form',
  templateUrl: './datasource-form.component.html',
  styleUrls: ['./datasource-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatasourceFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatasourceFormComponent),
      multi: true
    },
  ]
})
export class DatasourceFormComponent implements OnInit, ControlValueAccessor, Validator {

  @ViewChild(DatasourceRendererHostDirective, { static: true }) datasourceHost: DatasourceRendererHostDirective;

  datasources$ = this.dpm.getPlugins();

  formGroup = this.fb.group({
    plugin: this.fb.control('', [ Validators.required ]),
    settings: this.fb.control(''),
    renderer: this.fb.group({
      bindings: this.fb.array([])
    })
  });

  @Input() bindableOptions: Array<string> = [];

  componentRef$ = new BehaviorSubject<ComponentRef<any>>(undefined);

  public onTouched: () => void = () => {};

  get bindings(): FormArray {
    return this.formGroup.get('renderer').get('bindings') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private componentFactoryResolver: ComponentFactoryResolver,
    private dpm: DatasourcePluginManager
  ) { }

  ngOnInit(): void {
    this.formGroup.get('plugin').valueChanges.pipe(
      switchMap(p => this.dpm.getPlugin(p))
    ).subscribe(p => {
      this.renderPlugin(p);
    });
  }

  renderPlugin(plugin: DatasourcePlugin<string>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(plugin.editor);

    const viewContainerRef = this.datasourceHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef$.next(viewContainerRef.createComponent(componentFactory));
    // (componentRef.instance as any).settings = this.settings;
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

  addBinding() {
    this.bindings.push(this.fb.group({
      type: this.fb.control('pane', Validators.required),
      id: this.fb.control('', Validators.required)
    }));
  }

}
