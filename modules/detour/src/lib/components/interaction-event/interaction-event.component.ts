import { Component, ComponentFactoryResolver, ComponentRef, forwardRef, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { BehaviorSubject } from 'rxjs';
import { InteractionEventRendererHostDirective } from '../../directives/interaction-event-renderer-host.directive';
import { InteractionEventPlugin } from '../../models/interaction-event.models';
import { InteractionEventPluginManager } from '../../services/interaction-event-plugin-manager.service';

@Component({
  selector: 'druid-detour-interaction-event',
  templateUrl: './interaction-event.component.html',
  styleUrls: ['./interaction-event.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InteractionEventComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InteractionEventComponent),
      multi: true
    },
  ]
})
export class InteractionEventComponent implements ControlValueAccessor, Validator {

  @ViewChild(InteractionEventRendererHostDirective, { static: true }) interactionEventHost: InteractionEventRendererHostDirective;

  readonly eventForm = this.fb.group({
    plugin: this.fb.control(''),
    settings: this.fb.control('')
  });

  componentRef$ = new BehaviorSubject<ComponentRef<any>>(undefined);

  readonly eventPlugins$ = this.iepm.getPlugins()

  public onTouched: () => void = () => {};

  constructor(
    private fb: FormBuilder,
    private iepm: InteractionEventPluginManager,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
  }

  writeValue(val: any): void {
    if (val) {
      this.eventForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.eventForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.eventForm.disable()
    } else {
      this.eventForm.enable()
    }
  }
  validate(c: AbstractControl): ValidationErrors | null{
    return this.eventForm.valid ? null : this.eventForm.errors;
  }

  renderValidation(plugin: InteractionEventPlugin<string>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(plugin.editor);

    const viewContainerRef = this.interactionEventHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef$.next(viewContainerRef.createComponent(componentFactory));
  }

}