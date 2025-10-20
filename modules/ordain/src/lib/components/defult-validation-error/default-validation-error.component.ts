import { Component, Input } from "@angular/core";
import { ValidationValidator } from "../../models/validation.models";
import { ValidationPluginManager } from '../../services/validation-plugin-manager.service';
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { ValidationErrors } from "@angular/forms";
import { TokenizerService } from "@rollthecloudinc/token";

@Component({
    selector: 'druid-ordain-default-validation-error',
    templateUrl: './default-validation-error.component.html',
    styleUrls: ['./default-validation-error.component.scss'],
    standalone: false
})
export class DefaultValidationError {

  @Input() 
  set validators(validators: Array<ValidationValidator>) {
    this.validators$.next(validators);
  }

  @Input() 
  set errors(errors: ValidationErrors | null) {
    this.errors$.next(errors);
  }

  @Input()
  set resolvedContext(resolvedContext: any) {
    this.resolvedContext$.next(resolvedContext);
  }

  readonly validators$ = new BehaviorSubject<Array<ValidationValidator>>([]);
  readonly errors$ = new BehaviorSubject<ValidationErrors | null>(null);
  readonly message$ = new BehaviorSubject<string>('Field is invalid');
  readonly resolvedContext$ = new BehaviorSubject<any>(undefined);

  readonly messageSub = combineLatest([
    this.validators$,
    this.errors$,
    this.resolvedContext$
  ]).pipe(
    filter(([_, errors]) => errors !== null && Object.keys(errors).length !== 0),
    map(([validators, errors]) => {
      const [ k ] = Object.keys(errors);
      const v = validators.find(v => v.validator === k);
      return { k, v, e: errors[k] };
    }),
    switchMap(({ k, v, e }) => this.vpm.getPlugin(v.validator).pipe(
      map(p => ({ k, v, p, e }))
    )),
    switchMap(({ k, v, p, e }) => this.resolveContexts({ errors: e }).pipe(
      map(t => ({ k, v, p, t }))
    )),
    tap(({ p, t, v }) => {
      const replacedTokens = this.replaceTokens({ message: v.overrideErrorMessage && v.overrideErrorMessage !== '' ? v.overrideErrorMessage : p.errorMessage, tokens: t });
      this.message$.next(replacedTokens);
    })
  ).subscribe();

  constructor(
    private vpm: ValidationPluginManager,
    private tokenizerService: TokenizerService
  ) {
  }

  replaceTokens({ message, tokens }: { message: string, tokens: Map<string, any>  }): string {
    if(tokens !== undefined) {
      tokens.forEach((value, key) => {
        message = message.split(`[${key}]`).join(`${value}`)
      });
    }
    return message;
  }

  resolveContexts({ errors }: { errors: any }): Observable<undefined | Map<string, any>> {
    return new Observable(obs => {
      let tokens = new Map<string, any>(this.tokenizerService.generateGenericTokens(errors, ''));
      if(this.resolvedContext$.value) {
        for(const name in this.resolvedContext$.value) {
          tokens = new Map<string, any>([ ...tokens, ...this.tokenizerService.generateGenericTokens(this.resolvedContext$.value[name], name === '_root' ? '' : name) ]);
        }
      }
      obs.next(tokens);
      obs.complete();
    });
  }

}