import { Param } from './models/param.models';
import { ParamPlugin } from './models/param-plugin.models';
import { of } from 'rxjs';

export const staticParamFactory = () => {
  return new ParamPlugin<string>({
    id : 'static',
    title: 'Ttitle',
    evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> }) => of(param.mapping.value)
  });
};