import { Component, ComponentFactoryResolver, ComponentRef, forwardRef, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { BehaviorSubject } from 'rxjs';
import { InteractionHandlerRendererHostDirective } from '../../directives/interaction-handler-renderer-host.directive';
import { InteractionHandlerPlugin } from '../../models/interaction-handler.models';
import { InteractionHandlerPluginManager } from '../../services/interaction-handler-plugin-manager.service';

@Component({
  selector: 'druid-detour-interaction-handler',
  templateUrl: './interaction-handler.component.html',
  styleUrls: ['./interaction-handler.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InteractionHandlerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InteractionHandlerComponent),
      multi: true
    },
  ]
})
export class InteractionHandlerComponent implements ControlValueAccessor, Validator {

  @ViewChild(InteractionHandlerRendererHostDirective, { static: true }) interactionHandlerHost: InteractionHandlerRendererHostDirective;

  readonly handlerForm = this.fb.group({
    plugin: this.fb.control(''),
    settings: this.fb.control('')
  });

  componentRef$ = new BehaviorSubject<ComponentRef<any>>(undefined);

  readonly handlerPlugins$ = this.ihpm.getPlugins()

  public onTouched: () => void = () => {};

  constructor(
    private fb: FormBuilder,
    private ihpm: InteractionHandlerPluginManager,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
  }

  writeValue(val: any): void {
    if (val) {
      this.handlerForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.handlerForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.handlerForm.disable()
    } else {
      this.handlerForm.enable()
    }
  }
  validate(c: AbstractControl): ValidationErrors | null{
    return this.handlerForm.valid ? null : this.handlerForm.errors;
  }

  renderValidation(plugin: InteractionHandlerPlugin<string>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(plugin.editor);

    const viewContainerRef = this.interactionHandlerHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef$.next(viewContainerRef.createComponent(componentFactory));
  }

}