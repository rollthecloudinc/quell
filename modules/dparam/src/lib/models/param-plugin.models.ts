import { Plugin } from 'plugin';
import { Observable } from 'rxjs';
import { Param } from './param.models';

export class ParamPlugin<T = string> extends Plugin<T>  {
  evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> }) => Observable<any>;
  constructor(data?: ParamPlugin<T>) {
    super(data)
    if(data) {
      this.evalParam = data.evalParam;
    }
  }
}