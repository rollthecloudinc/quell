import { AfterViewInit, Component, ComponentRef, forwardRef, Input, ViewChild } from "@angular/core";
import { AbstractControl, ControlValueAccessor, UntypedFormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from "@angular/forms";
import { DataductPluginManager } from '../../services/dataduct-plugin-manager.service';
import { DataductRenderHostDirective } from '../../directives/dataduct-render-host.directive';
import { DataductPlugin, PersistenceFormPayload } from "../../models/refinery.models";
import { BehaviorSubject, Subject, combineLatest, of } from "rxjs";
import { delay, filter, map, switchMap, tap } from 'rxjs/operators';
@Component({
  selector: 'classifieds-ui-persistence-form',
  templateUrl: './persistence-form.component.html',
  styleUrls: ['./persistence-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PersistenceFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PersistenceFormComponent),
      multi: true
    },
  ]
})
export class PersistenceFormComponent implements AfterViewInit, ControlValueAccessor, Validator {
  @Input() contexts: Array<string> = [];
  @Input() set persistence(persistence: PersistenceFormPayload) {
    this.persistence$.next(persistence);
  }
  @ViewChild(DataductRenderHostDirective, { static: true }) datasourceHost: DataductRenderHostDirective;
  ductForm = this.fb.group({
    plugin: this.fb.control('', [ Validators.required ]),
    settings: this.fb.control(''),
  });
  ducts$ = this.dpm.getPlugins();
  componentRef$ = new BehaviorSubject<ComponentRef<any>>(undefined);
  persistence$ = new BehaviorSubject<PersistenceFormPayload>(undefined);
  afterViewInit$ = new Subject();
  contextForwardingSub = this.componentRef$.pipe(
    filter(componentRef => !!componentRef)
  ).subscribe(componentRef => {
    (componentRef.instance as any).contexts = this.contexts;
    (componentRef.instance as any).settings = this.persistence$.value && this.persistence$.value.dataduct ? this.persistence$.value.dataduct.settings : [];
  });

  persistenceSub = combineLatest([
    this.persistence$,
    this.afterViewInit$
  ]).pipe(
    map(([ p ]) => p),
    tap(persistence => {
      this.ductForm.get('plugin').setValue(persistence && persistence.dataduct? persistence.dataduct.plugin : '');
    }),
    delay(1),
    tap(persistence => {
      if (this.componentRef$.value && this.componentRef$.value.instance && persistence) {
        (this.componentRef$.value.instance as any).settings = persistence.dataduct ? persistence.dataduct.settings : [];
      }
    })
  ).subscribe();

  rendererSub = combineLatest([
    this.ductForm.get('plugin').valueChanges,
    this.afterViewInit$
  ]).pipe(
    switchMap(([p, _]) => p && p !== '' ? this.dpm.getPlugin(p) : of(undefined))
  ).subscribe(p => {
    if (p) {
      this.renderPlugin(p);
    }
  });
  public onTouched: () => void = () => {};
  constructor(
    private dpm: DataductPluginManager,
    // private componentFactoryResolver: ComponentFactoryResolver,
    private fb: UntypedFormBuilder
  ) {
  }
  ngAfterViewInit() {
    this.afterViewInit$.next(undefined);
  }
  writeValue(val: any): void {
    if (val) {
      this.ductForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.ductForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.ductForm.disable()
    } else {
      this.ductForm.enable()
    }
  }
  validate(c: AbstractControl): ValidationErrors | null{
    return this.ductForm.valid ? null : this.ductForm.errors;
  }

  renderPlugin(plugin: DataductPlugin<string>) {
    const viewContainerRef = this.datasourceHost.viewContainerRef;
    viewContainerRef.clear();
    this.componentRef$.next(viewContainerRef.createComponent(plugin.editor));
  }

}
