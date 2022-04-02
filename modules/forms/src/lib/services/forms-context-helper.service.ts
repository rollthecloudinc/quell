import { Injectable } from "@angular/core";
import { TokenizerService } from "@ng-druid/token";
import { PanelPageForm } from "@ng-druid/panels";
import { getDiff } from "recursive-diff";
import { Observable, ReplaySubject, Subject, take, tap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FormsContextHelperService {

  private readonly cachedResolvedContexts: Array<{ rContext: any, resolution$: ReplaySubject<undefined | Map<string, any>> }> = [];

  readonly scheduleResolution$ = new Subject<{ resolvedContext: any, index: number }>();
  readonly scheduleResolutionSub = this.scheduleResolution$.pipe(
    tap(({ resolvedContext, index }) => {
      let tokens = new Map<string, any>();
      if(resolvedContext) {
        for(const name in resolvedContext) {
          // PanelPageForm results in infinite recursion.
          // This could ne analyzed but reallu the panel page form isn't needed anyway here.
          if (!(resolvedContext[name] instanceof PanelPageForm)) {
            tokens = new Map<string, any>([ ...tokens, ...this.tokenizerService.generateGenericTokens(resolvedContext[name], name === '_root' ? '' : name) ]);
          }
        }
      }
      this.cachedResolvedContexts[index].resolution$.next(tokens);
    })
  ).subscribe();

  constructor(
    private tokenizerService: TokenizerService
  ) {
  }

  resolveContexts({ resolvedContext }: { resolvedContext: any }): Observable<undefined | Map<string, any>> {
    let cachedIndex = this.cachedResolvedContexts.findIndex(({ rContext }) => {
      const diff = getDiff(rContext, resolvedContext);
      return diff.length === 0;
    });
    if (cachedIndex === -1) {
      console.log('resolved context no cache', resolvedContext);
      cachedIndex = this.cachedResolvedContexts.length;
      this.cachedResolvedContexts.push({ rContext: resolvedContext, resolution$: new ReplaySubject<undefined | Map<string, any>>() });
      this.scheduleResolution$.next({ resolvedContext, index: cachedIndex });
    } else {
      console.log('resolved context cache hit',  resolvedContext);
    }
    return this.cachedResolvedContexts[cachedIndex].resolution$.pipe(take(1));
  }

}