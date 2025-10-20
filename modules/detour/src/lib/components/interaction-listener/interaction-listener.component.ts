import { Component, forwardRef, Input } from '@angular/core';
import { AbstractControl, ControlValueAccessor, UntypedFormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { ParamPluginInstance } from '@rollthecloudinc/dparam';
import { BehaviorSubject, tap } from 'rxjs';
import { InteractionListener } from '../../models/interaction.models';
import { InteractionEventPluginManager } from '../../services/interaction-event-plugin-manager.service';
import { InteractionHandlerPluginManager } from '../../services/interaction-handler-plugin-manager.service';
// import { ControlContainer } from '@angular/forms';
//import { ValidationValidatorSettings } from '../../models/validation.models';

@Component({
    selector: 'druid-detour-interaction-listener',
    templateUrl: './interaction-listener.component.html',
    styleUrls: ['./interaction-listener.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InteractionListenerComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => InteractionListenerComponent),
            multi: true
        },
    ],
    standalone: false
})
export class InteractionListenerComponent implements ControlValueAccessor, Validator {
  //@Input() settings: Array<ValidationValidatorSettings> = [];
  readonly eventPlugins$ = this.iepm.getPlugins()
  readonly handlerPlugins$ = this.ihpm.getPlugins()
  readonly listenerForm = this.fb.group({
    event: this.fb.control(''),
    handler: this.fb.control('')
  });
  @Input() contexts: Array<string> = [];
  @Input() set listener(listener: InteractionListener) {
    this.listener$.next(listener);
  }
  readonly listener$ = new BehaviorSubject<InteractionListener>(new InteractionListener());
  readonly event$ = new BehaviorSubject<ParamPluginInstance>(new ParamPluginInstance());
  readonly handler$ = new BehaviorSubject<ParamPluginInstance>(new ParamPluginInstance());
  readonly listenerSub = this.listener$.pipe(
    tap(listener => {
      this.event$.next(listener && listener.event ? listener.event : new ParamPluginInstance());
      this.handler$.next(listener && listener.handler ? listener.handler : new ParamPluginInstance());
    })
  ).subscribe();
  public onTouched: () => void = () => {};
  constructor(
    private fb: UntypedFormBuilder,
    private iepm: InteractionEventPluginManager,
    private ihpm: InteractionHandlerPluginManager
  ) {}
  writeValue(val: any): void {
    if (val) {
      this.listenerForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.listenerForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.listenerForm.disable()
    } else {
      this.listenerForm.enable()
    }
  }
  validate(c: AbstractControl): ValidationErrors | null{
    return this.listenerForm.valid ? null : this.listenerForm.errors;
  }
}