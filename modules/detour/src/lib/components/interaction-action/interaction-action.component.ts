import { Component, ComponentFactoryResolver, ComponentRef, forwardRef, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { BehaviorSubject } from 'rxjs';
import { InteractionActionRendererHostDirective } from '../../directives/interaction-action-render-host.directive';
import { InteractionActionPlugin } from '../../models/interaction-action.models';
import { InteractionActionPluginManager } from '../../services/interaction-action-plugin-manager.service';

@Component({
  selector: 'druid-detour-interaction-action',
  templateUrl: './interaction-action.component.html',
  styleUrls: ['./interaction-action.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InteractionActionComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InteractionActionComponent),
      multi: true
    },
  ]
})
export class InteractionActionComponent implements ControlValueAccessor, Validator {

  @ViewChild(InteractionActionRendererHostDirective, { static: true }) interactionActionHost: InteractionActionRendererHostDirective;

  readonly actionForm = this.fb.group({
    plugin: this.fb.control(''),
    settings: this.fb.control('')
  });

  componentRef$ = new BehaviorSubject<ComponentRef<any>>(undefined);

  readonly actionPlugins$ = this.iapm.getPlugins()

  public onTouched: () => void = () => {};

  constructor(
    private fb: FormBuilder,
    private iapm: InteractionActionPluginManager,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
  }

  writeValue(val: any): void {
    if (val) {
      this.actionForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.actionForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.actionForm.disable()
    } else {
      this.actionForm.enable()
    }
  }
  validate(c: AbstractControl): ValidationErrors | null{
    return this.actionForm.valid ? null : this.actionForm.errors;
  }

  renderValidation(plugin: InteractionActionPlugin<string>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(plugin.editor);

    const viewContainerRef = this.interactionActionHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef$.next(viewContainerRef.createComponent(componentFactory));
  }

}