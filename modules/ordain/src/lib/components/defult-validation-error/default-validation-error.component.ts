import { Component, Input } from "@angular/core";
import { ValidationValidator } from "../../models/validation.models";
import { ValidationPluginManager } from '../../services/validation-plugin-manager.service';
import { BehaviorSubject, combineLatest } from "rxjs";
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { ValidationErrors } from "@angular/forms";

@Component({
  selector: 'druid-ordain-default-validation-error',
  templateUrl: './default-validation-error.component.html',
  styleUrls: ['./default-validation-error.component.scss']
})
export class DefaultValidationError {

  @Input() set validators(validators: Array<ValidationValidator>) {
    this.validators$.next(validators);
  }

  @Input() set errors(errors: ValidationErrors | null) {
    this.errors$.next(errors);
  }

  readonly validators$ = new BehaviorSubject<Array<ValidationValidator>>([]);
  readonly errors$ = new BehaviorSubject<ValidationErrors | null>(null);
  readonly message$ = new BehaviorSubject<string>('Field is invalid');

  readonly messageSub = combineLatest([
    this.validators$,
    this.errors$
  ]).pipe(
    filter(([_, errors]) => errors !== null && Object.keys(errors).length !== 0),
    map(([validators, errors]) => {
      const [ k ] = Object.keys(errors);
      const v = validators.find(v => v.validator === k);
      return { k, v };
    }),
    switchMap(({ k, v }) => this.vpm.getPlugin(v.validator).pipe(
      map(p => ({ k, v, p }))
    )),
    tap(({ p }) => {
      this.message$.next(p.errorMessage);
    })
  ).subscribe();

  constructor(
    private vpm: ValidationPluginManager
  ) {

  }

}