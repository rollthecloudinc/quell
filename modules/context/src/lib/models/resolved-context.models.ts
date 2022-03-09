import { Plugin } from '@ng-druid/plugin'
import { Observable } from 'rxjs';
export class ResolvedContextPlugin<T=string> extends Plugin<T> {
  resolve: () => Observable<any>;
  resolveSingle: () => Observable<any>;
  constructor(data?: ResolvedContextPlugin<T>) {
    super(data);
    this.resolve = data.resolve;
    this.resolveSingle = data.resolveSingle;
  }
}