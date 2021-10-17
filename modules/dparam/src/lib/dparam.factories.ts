import { Param } from './models/param.models';
import { ParamPlugin } from './models/param-plugin.models';
import { of } from 'rxjs';

// This needs to be able to resolve dynamic flagged values.
export const staticParamFactory = () => {
  return new ParamPlugin<string>({
    id : 'static',
    title: 'Static',
    evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> }) => of(/*param.mapping.value*/)
  });
};