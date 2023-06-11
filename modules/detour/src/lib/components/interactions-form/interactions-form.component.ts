import { AfterViewInit, Component, forwardRef, Input } from "@angular/core";
import { AbstractControl, ControlValueAccessor, UntypedFormArray, UntypedFormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { InlineContext } from "@rollthecloudinc/context";
import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { filter, map, tap } from 'rxjs/operators';
import { InteractionsFormPayload } from "../../models/interaction.models";

@Component({
  selector: 'druid-detour-interactions-form',
  templateUrl: './interactions-form.component.html',
  styleUrls: ['./interactions-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InteractionsFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InteractionsFormComponent),
      multi: true
    },
  ]
})
export class InteractionsFormComponent implements ControlValueAccessor, Validator, AfterViewInit {

  @Input() set interactions(interactions: InteractionsFormPayload) {
    this.interactions$.next(interactions);
  }

  @Input() set contexts(contexts: Array<InlineContext>) {
    this.contexts$.next(contexts);
  }

  interactions$ = new BehaviorSubject<InteractionsFormPayload>(new InteractionsFormPayload({ interactions: { listeners: [] } }));
  contexts$ = new BehaviorSubject<Array<InlineContext>>([]);
  afterViewInit$ = new Subject();

  interactionsForm = this.fb.group({
    listeners: this.fb.array([])
  });

  readonly addListener$ = new Subject();
  readonly deleteListener$ = new Subject<number>();

  readonly addListenerSub = this.addListener$.pipe(
    tap(() => this.listeners.push(this.fb.control('')))
  ).subscribe();

  readonly deleteListenerSub = this.deleteListener$.pipe(
    tap(index => {
      this.interactions$.value.interactions.listeners.splice(index, 1);
      this.listeners.removeAt(index);
    })
  ).subscribe();

  readonly interactionsSub = combineLatest([
    this.interactions$,
    this.afterViewInit$
  ]).pipe(
    map(([v]) => v),
    filter(interactions => interactions.interactions.listeners.length !== 0),
    tap(interactions => {
      this.listeners.clear();
      interactions.interactions.listeners.forEach((v, i) => {
        this.listeners.push(this.fb.control(''));
      });
    })
  ).subscribe();

  public onTouched: () => void = () => {};

  get listeners(): UntypedFormArray {
    return this.interactionsForm.get('listeners') as UntypedFormArray;
  }

  constructor(
    private fb: UntypedFormBuilder
  ) {
  }

  ngAfterViewInit(): void {
    this.afterViewInit$.next(undefined);
    this.afterViewInit$.complete();
  }

  writeValue(val: any): void {
    if (val) {
      this.interactionsForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.interactionsForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.interactionsForm.disable()
    } else {
      this.interactionsForm.enable()
    }
  }
  validate(c: AbstractControl): ValidationErrors | null{
    return this.interactionsForm.valid ? null : this.interactionsForm.errors;
  }

}