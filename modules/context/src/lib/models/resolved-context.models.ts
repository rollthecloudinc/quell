import { Plugin } from 'plugin'
import { Observable } from 'rxjs';
import { InlineContext } from './context.models';

export class ResolvedContextPlugin<T=string> extends Plugin<T> {
  resolve: () => Observable<any>;
  resolveSingle: () => Observable<any>;
  resolveMerged: (contexts: Array<InlineContext>, tag: string) => Observable<any>;
  resolveMergedSingle: (contexts: Array<InlineContext>, tag: string) => Observable<any>;
  constructor(data?: ResolvedContextPlugin<T>) {
    super(data);
    this.resolve = data.resolve;
    this.resolveSingle = data.resolveSingle;
    this.resolveMerged = data.resolveMerged;
    this.resolveMergedSingle = data.resolveMergedSingle;
  }
}