import { Param } from './models/param.models';
import { ParamPlugin } from './models/param-plugin.models';
import { of } from 'rxjs';
import { ParamEvaluatorService } from './services/param-evaluator.service';
import { map, switchMap } from 'rxjs/operators';

// This needs to be able to resolve dynamic flagged values. -- I forgot what this means...
export const staticParamFactory = () => {
  return new ParamPlugin<string>({
    id : 'static',
    title: 'Static',
    evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> }) => of(param.mapping.value)
  });
};

export const inputParamFactory = (paramEvaluatorService: ParamEvaluatorService) => {
  return new ParamPlugin<string>({
    id : 'inputparam',
    title: 'Input Param',
    evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> }) => of(param.mapping.value).pipe(
      map(name => metadata.has('inputparams') && metadata.get('inputparams').has(name) ? metadata.get('inputparams').get(name) : undefined),
      switchMap(param => param ? paramEvaluatorService.paramValue(param, metadata) : of(param.mapping.testValue))
    )
  });
};