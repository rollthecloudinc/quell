import { Injectable } from '@angular/core';
import { RuleSet } from 'angular2-query-builder';
import { Observable } from 'rxjs';
import { RulesParserService } from './rules-parser.service';
import { InlineContext, InlineContextResolverService } from '@rollthecloudinc/context';
import { Engine } from 'json-rules-engine';
import { map, tap, switchMap, take } from 'rxjs/operators';
// we are going to loose forms when doing this.
// import { InlineContextResolverService } from './inline-context-resolver.service';
import * as uuid from 'uuid';
// import { Rule } from 'json-rules-engine'

@Injectable({
  providedIn: 'root'
})
export class RulesResolverService {

  constructor(
    private rulesParser: RulesParserService,
    private inlineContextResolver: InlineContextResolverService
  ) { }

  evaluate(ngRule: RuleSet, contexts: Array<InlineContext> = []): Observable<boolean> {
    return this.inlineContextResolver.resolveMerged(contexts, `rules:${uuid.v4()}`).pipe(
      take(1),
      map(facts => [{ ...(facts as any) }, new Engine()]),
      tap(([_, engine]) => {
        const rule = this.rulesParser.toEngineRule(ngRule);
        engine.addRule(rule);
      }),
      switchMap(([facts, engine]) => new Observable<boolean>(obs => {
        engine.run(facts).then(res => {
          obs.next(res.events.findIndex(e => e.type === 'visible') > -1);
          obs.complete();
        });
      }))
    );
    // A bit easier to debug using breakpoints.
    /*return new Observable<boolean>(obs => {
      const name = `rules:${uuid.v4()}`;
      this.inlineContextResolver.resolveMerged(contexts, name).pipe(
        take(1),
        map(facts => [{ ...facts }, new Engine()]),
        tap(([facts, engine]) => {
          const rule = this.rulesParser.toEngineRule(ngRule);
          engine.addRule(new Rule({ 
            ...rule, 
            onSuccess: () => {
              obs.next(true);
              obs.complete();
            },
            onFailure: () => {
              obs.next(false);
              obs.complete();
            },
            name 
          }));
          engine.run(facts).then(() => {
            console.log('facts ran!');
          });;
        })
      ).subscribe(() => {
        console.log(`subscription complete for rule ${name}`);
      });
    });*/
  }
}
