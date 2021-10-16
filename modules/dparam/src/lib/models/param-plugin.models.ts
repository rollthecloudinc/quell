import { Plugin } from 'plugin';
import { Observable } from 'rxjs';
import { Param } from './param.models';

export class ParamPlugin<T = string> extends Plugin<T>  {
  condition?: ({ param, metadata }: { param: Param, metadata: Map<string, any> }) => boolean;
  evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> }) => Observable<any>;
  usedContexts?: ({ param, metadata }: { param: Param, metadata: Map<string, any> }) => Observable<Array<string>>;
  constructor(data?: ParamPlugin<T>) {
    super(data)
    if(data) {
      this.evalParam = data.evalParam;
      if (data.condition) {
        this.condition = data.condition;
      }
      if (data.usedContexts) {
        this.usedContexts = data.usedContexts;
      }
    }
  }
}