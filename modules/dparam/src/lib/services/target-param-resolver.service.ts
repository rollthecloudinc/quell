import { Injectable } from '@angular/core';
import { Param } from '../models/param.models';
import { ParamEvaluatorService } from './param-evaluator.service';
import { TokenizerService } from '@rollthecloudinc/token';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TargetParamResolverService {

  constructor(
    private evaluator: ParamEvaluatorService,
    private tokenizer: TokenizerService
  ) {}

  /**
   * Resolves paramsString + params[] into final usable values.
   *
   * @param paramsString  The raw querystring. e.g. "id=:id&path=/homes/[.id]"
   * @param paramsArray   The array of Param objects aligned by index.
   * @param context       The pane's resolved context (for token replacement).
   */
  resolveParamsForTarget(
    paramsString: string,
    paramsArray: Array<Param>,
    context: any
  ): Observable<{ [key: string]: any }> {

    if (!paramsString || !paramsArray || paramsArray.length === 0) {
      return of({});
    }

    // 1. Get param names from paramsString
    const paramNames = paramsString
      .split('&')
      .map(pair => pair.split('=', 2)[0]);

    // 2. Build Map<string, Param>
    const paramMap = paramsArray.reduce((acc, param, idx) => {
      const name = paramNames[idx];
      acc.set(name, param);
      return acc;
    }, new Map<string, Param>());

    console.log('Resolving params for target:', { paramsString, paramsArray, paramMap });

    // 3. Evaluate using ParamEvaluatorService
    return this.evaluator.paramValues(paramMap).pipe(
      switchMap(rawValues => {
        let tokens = new Map<string, any>();

        // Convert Map to object
        const rawObj = Array.from(rawValues.entries()).reduce(
          (o, [k, v]) => ({ ...o, [k]: v }),
          {}
        );

        for(const name in context) {
            tokens = new Map<string, any>([ ...tokens, ...this.tokenizer.generateGenericTokens(context[name], name === '_root' ? '' : name) ]);
        }

        // 5. Replace tokens inside each value
        const finalObj: { [key: string]: any } = {};

        for (const key of Object.keys(rawObj)) {
          const val = rawObj[key];
          if (typeof val === 'string') {
            finalObj[key] = this.tokenizer.replaceTokens(val, tokens);
          } else {
            finalObj[key] = val;
          }
        }

        return of(finalObj);
      })
    );
  }
}