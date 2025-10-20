import { AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { DatasourcePluginManager } from '../../services/datasource-plugin-manager.service';
import { AbstractControl, ControlValueAccessor, UntypedFormArray, UntypedFormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Datasource, DatasourcePlugin } from '../../models/datasource.models';
import { DatasourceRendererHostDirective } from '../../directives/datasource-renderer-host.directive';
import { BehaviorSubject, combineLatest, of, Subject } from 'rxjs';
import { ContentBinding } from '@rollthecloudinc/content';
import { AttributeValue } from '@rollthecloudinc/attributes';

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
    ],
    standalone: false
})
export class DatasourceFormComponent implements OnInit, ControlValueAccessor, Validator, AfterViewInit {

  @ViewChild(DatasourceRendererHostDirective, { static: true }) datasourceHost: DatasourceRendererHostDirective;

  datasources$ = this.dpm.getPlugins();

  formGroup = this.fb.group({
    plugin: this.fb.control('', [ Validators.required ]),
    settings: this.fb.control(''),
    renderer: this.fb.group({
      type: this.fb.control('pane'),
      bindings: this.fb.array([])
    })
  });

  @Input() bindableOptions: Array<string> = [];
  @Input() contexts: Array<string> = [];

  @Input() set datasource(ds: Datasource) {
    this.datasource$.next(ds);
  }

  settings$ = new BehaviorSubject<Array<AttributeValue>>([]);

  componentRef$ = new BehaviorSubject<ComponentRef<any>>(undefined);
  datasource$ = new BehaviorSubject<Datasource>(undefined);
  afterViewInit$ = new Subject();

  contextForwardingSub = this.componentRef$.pipe(
    filter(componentRef => !!componentRef)
  ).subscribe(componentRef => {
    (componentRef.instance as any).contexts = this.contexts;
    (componentRef.instance as any).settings = this.settings$.value;
  });

  rendererSub = combineLatest([
    this.formGroup.get('plugin').valueChanges,
    this.afterViewInit$
  ]).pipe(
    switchMap(([p, _]) => p && p !== '' ? this.dpm.getPlugin(p) : of(undefined))
  ).subscribe(p => {
    if (p) {
      this.renderPlugin(p);
    }
  });

  settingsSub = combineLatest([
    this.componentRef$,
    this.settings$
  ]).pipe(
    filter(([componentRef, _]) => !!componentRef)
  ).subscribe(([componentRef, s]) => {
    (componentRef.instance as any).settings = s;
  })

  datasourceSub = this.datasource$.pipe(
    tap(ds => {
      setTimeout(() => this.settings$.next(ds ? ds.settings : []));
    })
  ).subscribe(ds => {
    (this.formGroup.get('renderer').get('bindings') as UntypedFormArray).clear();
    if (ds) {
      this.formGroup.get('plugin').setValue(ds.plugin);
      this.formGroup.get('renderer').get('type').setValue('pane');
      if (ds.renderer && ds.renderer.bindings) {
        ds.renderer.bindings.forEach(b => {
          this.addBinding(b);
        });
      }
    } else {
      this.formGroup.get('plugin').setValue('');
      this.formGroup.get('renderer').get('type').setValue('pane');
    }
  });

  public onTouched: () => void = () => {};

  get bindings(): UntypedFormArray {
    return this.formGroup.get('renderer').get('bindings') as UntypedFormArray;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private componentFactoryResolver: ComponentFactoryResolver,
    private dpm: DatasourcePluginManager
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.afterViewInit$.next(undefined);
  }

  renderPlugin(plugin: DatasourcePlugin<string>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(plugin.editor);

    const viewContainerRef = this.datasourceHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef$.next(viewContainerRef.createComponent(componentFactory));
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

  addBinding(b?: ContentBinding) {
    this.bindings.push(this.fb.group({
      type: this.fb.control('pane', Validators.required),
      id: this.fb.control(b ? b.id : '', Validators.required)
    }));
  }

  removeBinding(index: number) {
    this.bindings.removeAt(index);
  }

}
